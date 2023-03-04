import { Context, h, Logger, Schema } from 'koishi'
import fs from 'fs';
import { Chatbot } from './chatbot';
import { Config } from './config';

export * from './config';
export const name = 'openai-api';
export const usage = `openai的api被墙了，国内用户必须要翻墙才能用。\n
每个账号的记忆是分开的，目前每个账号最长能记忆的Token数是max_tokens。\n
每次对话都会附上历史对话，openai服务器端限制输入和输出加在一起的Token数不能超过4096，
所以max_tokens不能调太大，否则输出会被截断。\n
之后可能会更改记忆策略。`

const logger = new Logger(name);

function getReplyCondition(session, config) {
  if (session.subtype === 'group') { // 群聊
    if (session.parsed.appel)
      return 1; // @bot
    if (session.content.includes(config.bot_name))
      return 2; // 包含botname
    return 0; // 不回复
  }
  else {
    return 3; // 私聊
  }
}

async function chat(chatbot: Chatbot, uid: string, prompt: string, setting: boolean, reset: boolean) {
  uid = uid.replace(":", "_");
  if (reset) {
    if (fs.existsSync(`${chatbot.memory_dir}/${uid}.json`)) {
      fs.unlinkSync(`${chatbot.memory_dir}/${uid}.json`);
      return "重置成功";
    }
  }
  if (setting) {
    let memory = chatbot.load_memory(uid);
    memory[0].content = prompt;
    chatbot.save_memory(uid, memory);
    return "设定成功";
  }
  let memory = chatbot.load_memory(uid);
  memory.push({ "role": "user", "content": prompt });
  let message = await chatbot.ask(memory);
  chatbot.save_memory(uid, memory, message);
  return message.content;
}

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh', require('./locales/zh'));

  const chatbot = new Chatbot(
    ctx,
    config.api_key,
    config.model,
    config.max_tokens,
    config.temperature,
    config.presence_penalty,
    config.frequency_penalty,
    config.memory_dir,
  );

  const cmd1 = ctx.command(`openai-api`)
  const cmd2 = ctx.command(`设定 <设定bot的人格:text>`)
    .alias('set')
    .action(async ({ session }, input) => {
      if (!input?.trim()) return session.execute(`help ${name}`)
      try {
        await session.send(
          h('quote', { id: session.messageId }) + await chat(chatbot, session.uid, input, true, false)
        )
      }
      catch { return session.text('.network-error') }
    })
  const cmd3 = ctx.command(`重置`)
    .alias('reset')
    .action(async ({ session }, input) => {
      try {
        await session.send(
          h('quote', { id: session.messageId }) + await chat(chatbot, session.uid, input, false, true)
        )
      }
      catch { return session.text('.network-error') }
    })
  ctx.middleware(async (session, next) => {
    if (ctx.bots[session.uid])
      return; // ignore bots from self
    const condition = getReplyCondition(session, config);
    if (condition === 0)
      return next(); // 不回复
    const input = session.content.replace(/<[^>]*>/g, ''); // 去除XML元素
    if (input === '')
      return next(); // ignore empty message
    logger.info(`condition ${condition} met, replying`);
    try {
      await session.send(
        h('quote', { id: session.messageId }) + await chat(chatbot, session.uid, input, false, false)
      )
    }
    catch { return session.text('.network-error') }
  })
}
