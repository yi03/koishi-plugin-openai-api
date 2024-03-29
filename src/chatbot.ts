import fs from 'fs';

export class Chatbot {
  private ctx;
  private model: string;
  private api_key: string;
  private bot_name: string;
  private max_tokens: number;
  private temperature: number;
  private presence_penalty: number;
  private frequency_penalty: number;
  public memory_dir: string;
  private system_prompt: string;
  constructor(
    ctx,
    api_key: string,
    bot_name: string,
    model: string,
    max_tokens: number,
    temperature: number,
    presence_penalty: number,
    frequency_penalty: number,
    memory_dir: string,
    system_prompt: string,
  ) {
    this.ctx = ctx;
    this.api_key = api_key;
    this.bot_name = bot_name;
    this.model = model;
    this.max_tokens = max_tokens;
    this.temperature = temperature;
    this.presence_penalty = presence_penalty;
    this.frequency_penalty = frequency_penalty;
    this.memory_dir = memory_dir;
    this.system_prompt = system_prompt;
  }

  private truncate_conversation(messages: any[]) {
    while (true) {
      const full_conversation = messages.map(m => m.content).join('\n');
      if (full_conversation.length > this.max_tokens && messages.length > 1) {
        messages.splice(1, 1);
      } else {
        break;
      }
    }
  }

  public async ask(messages: any[]) {
    this.truncate_conversation(messages);
    const response = await this.ctx.http.axios({
      url: "https://api.openai.com/v1/chat/completions",
      headers: { 'Authorization': `Bearer ${this.api_key}`, },
      data: {
        "model": this.model,
        "messages": messages,
        "temperature": this.temperature,
        "presence_penalty": this.presence_penalty,
        "frequency_penalty": this.frequency_penalty,
      },
      method: 'post',
    });
    return response.data.choices[0].message;
  }

  public load_memory(uid: string) {
    /**
     * Load the conversation from a JSON file
     */
    const filename: string = `${this.memory_dir}/${uid}.json`;
    if (fs.existsSync(filename)) {
      const fileContent: string = fs.readFileSync(filename, 'utf-8');
      return JSON.parse(fileContent);
    } else {
      return [{
        "role": "system",
        "content": `${this.system_prompt}你的名字是${this.bot_name}。`,
      }];
    }
  }

  public save_memory(uid: string, memory: Array<object>, message?: object) {
    /**
     * Save the conversation to a JSON file
     */
    if (!fs.existsSync(this.memory_dir)) {
      fs.mkdirSync(this.memory_dir);
    }
    const filename: string = `${this.memory_dir}/${uid}.json`;
    if (message) {
      memory.push(message);
    }
    const fileContent: string = JSON.stringify(memory, null, 2);
    fs.writeFileSync(filename, fileContent, 'utf-8');
  }

  public async get_balance() {
    const response = await this.ctx.http.axios({
      url: "https://api.openai.com/dashboard/billing/credit_grants",
      headers: {
        'Authorization': `Bearer ${this.api_key}`,
        'Content-Type': 'application/json',
      },
      method: 'get',
    });
    return response.data.total_available;
  }
}
