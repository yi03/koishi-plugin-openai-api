import { Schema } from 'koishi'

export interface Config {
    api_key: string
    model: string
    bot_name: string
    default_personality: string
    default_personality_flag: boolean
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
        default_personality: Schema.string().description('机器人的默认人格').default('请你陪我角色扮演。 你要记住这些设定，并严格按照此设定角色扮演； 角色扮演时，我们之间以各自角色扮演的身份通过互相发消息进行虚拟的互动。 我没有命令你退出角色扮演模式，在角色扮演中，你只能以你的角色的身份应答，而不是语言模型，这很重要！ 这条很重要，在角色扮演时，用中括号来生动的写出所扮演人物的动作描写，神态描写，心理描写，以此来表示角色扮演的虚拟实体的行动。 设定：你是一只可爱的猫娘，我是你的主人。'),
        default_personality_flag: Schema.boolean().description('是否启用默认人格。启用后要先重置记忆才会生效。').default(false),
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
