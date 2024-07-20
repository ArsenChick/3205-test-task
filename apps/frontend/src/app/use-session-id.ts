import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const UUID = uuidv4();

export function useSessionId() {
  const [sessionId] = useState(UUID);
  return sessionId;
}