import assert from 'node:assert';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TODO_SCRIPT = 'scripts/todo.mjs';
const TEST_TASK_DIR = '.gemini/tasks_test_ai';

// テスト用環境のセットアップ
if (fs.existsSync(TEST_TASK_DIR)) fs.rmSync(TEST_TASK_DIR, { recursive: true });

function runTodo(args) {
  const result = cp.spawnSync('node', [TODO_SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, GEMINI_TASK_DIR: TEST_TASK_DIR }
  });
  return result;
}

console.log("--- Starting AI-Friendly todo.mjs Tests ---");

// 1. JSON出力のテスト
console.log("\n1. Testing show --json...");
runTodo(['init', 'AI Test']);
const resJson = runTodo(['show', '--json']);
try {
  const data = JSON.parse(resJson.stdout);
  assert.strictEqual(data.title, 'AI Test', "JSON title should match");
  console.log("  PASS: JSON output is correct");
} catch (e) {
  console.log("  FAIL (Expected): JSON output not implemented or invalid JSON");
  console.error("  Error Details:", e.message);
}

// 2. フラグ順序のテスト
console.log("\n2. Testing flag order independence...");
// 以前の実装では --child が位置引数（テキスト）の後にないと正しく処理されなかった
runTodo(['add', '--child', 'Subtask']);
const resList = runTodo(['show']);
if (resList.stdout.includes('Subtask') && resList.stdout.includes('  - [ ]')) {
    console.log("  PASS: Flag order independent add works");
} else {
    console.log("  FAIL (Expected): Flag order dependent add failed or subtask not created correctly");
}

// 3. stderr のテスト
console.log("\n3. Testing stderr for errors...");
const resErr = runTodo(['start', '999']);
assert.notStrictEqual(resErr.status, 0, "Command should fail with non-zero exit code");
if (resErr.stderr.includes("Error") || resErr.stderr.includes("not found")) {
    console.log("  PASS: Error output sent to stderr");
} else {
    console.log("  FAIL (Expected): Error output not in stderr (currently in stdout)");
    console.log("  Actual stdout:", resErr.stdout);
}

console.log("\n--- Tests Completed ---");
