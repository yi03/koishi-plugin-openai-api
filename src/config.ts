import { Schema } from 'koishi'

export interface Config {
    api_key: string
    model: string
    bot_name: string
    appel_flag: boolean
    include_bot_name_flag: boolean
    private_message_flag: boolean
    max_tokens: number
    temperature: number
    presence_penalty: number
    frequency_penalty: number
    memory_dir: string
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        api_key: Schema.string().required().role('secret').description('OpenAI 的 API Key'),
        model: Schema.union([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0301',
        ]).description('OpenAI 的语言模型，默认使用gpt-3.5-turbo')
            .default('gpt-3.5-turbo'),
    }).description("OpenAI 配置"),
    Schema.object({
        bot_name: Schema.string().description('机器人的名字'),
        appel_flag: Schema.boolean().description('艾特机器人或回复机器人机器人是否会回复').default(true),
        include_bot_name_flag: Schema.boolean().description('消息含有机器人的名字机器人是否会回复').default(true),
        private_message_flag: Schema.boolean().description('私聊机器人机器人是否会回复').default(true),
        memory_dir: Schema.string().description('记忆文件的路径').default("./openai-api_memory"),
        max_tokens: Schema.number().description('最长能记忆的Token数。设置的太大的话回复可能会被截断')
            .min(16).max(4096).step(1).default(3000),
        temperature: Schema.number().description('回复温度，越高越随机')
            .min(0).max(2).step(0.1).default(0.2),
        presence_penalty: Schema.number().description('重复惩罚，越高越不易重复出现过至少一次的Token，不建议设置的太极端')
            .min(-2).max(2).step(0.1).default(0.2),
        frequency_penalty: Schema.number().description('频率惩罚，越高越不易重复出现次数较多的Token，不建议设置的太极端')
            .min(-2).max(2).step(0.1).default(0.2),
    }).description("机器人配置"),
])
