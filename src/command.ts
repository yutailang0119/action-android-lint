import * as core from '@actions/core'
import {Message} from './message'

export const workflowMessage = (message: Message): string => {
  return `::${message.severity} file=${message.path},line=${message.line},col=${message.column}::${message.description}`
}

export async function echoMessages(messages: Message[]): Promise<void> {
  for (const message of messages) {
    core.info(workflowMessage(message))
  }
}
