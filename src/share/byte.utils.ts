export function stringToBytes(text: string): number[] {
  const bytes = [];
  const length = text.length;
  for (let i = 0; i < length; i++) {
    bytes.push(text.charCodeAt(i));
  }

  return bytes;
}

export function numberTo4Bytes(value: number): number[] {
  const bytes: number[] = [];

  bytes.push((value >> 24) & 0xFF);      // 1 byte
  bytes.push((value >> 16) & 0xFF);      // 1 byte
  bytes.push((value >> 8) & 0xFF);       // 1 byte
  bytes.push((value >> 0) & 0xFF);       // 1 byte

  return bytes;
}
