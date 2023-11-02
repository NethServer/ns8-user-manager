export class MessageBag extends Map<string, Array<string>> {
  /**
   * Append a record to the bag.
   * @param key
   * @param message
   */
  append(key: string, message: string) {
    if (!this.has(key)) {
      this.set(key, [])
    }
    this.get(key)!.push(message)
  }

  /**
   * Helper function that is compatible with vuei18n.
   * @param key
   */
  getFirstMessage(key: string): string {
    if (this.has(key)) {
      return this.get(key)![0]
    } else {
      return ''
    }
  }
}
