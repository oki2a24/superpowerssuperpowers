/**
 * SuperpowersSuperpowers plugin for OpenCode.ai
 *
 * Injects the superpowers bootstrap into every session and auto-registers the
 * skills/ directory so OpenCode discovers every core skill — no symlinks and no
 * opencode.json skills.paths entry required.
 *
 * Installed via a git-backed plugin spec, e.g. in opencode.json:
 *   { "plugin": ["superpowerssuperpowers@git+https://github.com/oki2a24/superpowerssuperpowers.git"] }
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal YAML-ish frontmatter extraction (one key per line). Good enough to
// strip the `---` block off SKILL.md for bootstrap injection without pulling in
// a dependency on any skills-core module.
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// The SKILL.md content is fixed for the lifetime of a session, so read + parse
// it once and cache the assembled bootstrap string. The transform hook fires on
// every agent step, so re-reading the file and re-parsing each time is wasted
// work.  The cache uses `undefined` = not yet loaded, `null` = file missing, a
// string = assembled bootstrap.
let _bootstrapCache = undefined;

// This is the single source of truth for the runtime-action -> opencode-tool
// mapping.  It must be kept in sync with
// skills/using-superpowers/references/opencode-tools.md (the human/AI-readable
// copy of the same mapping).  If the two drift, the port is half-done.
const toolMapping = `**Tool Mapping for opencode:**
When skills request actions, substitute opencode's native tools:
- Create or update todos / mark a todo complete → \`todowrite\`
- \`Subagent (general-purpose):\` → the \`task\` tool with \`subagent_type: "general"\` (use \`"explore"\` for codebase exploration)
- Invoke / load a skill → opencode's native \`skill\` tool
- Read a file → \`read\`
- Create a file → \`write\`
- Edit a file → \`edit\`
- Run a shell command → \`bash\`
- Find files by name → \`glob\`
- Search file contents → \`grep\`
- Ask the user a structured question → \`question\`
- Fetch a URL → \`webfetch\`

opencode has no \`apply_patch\` tool — use \`write\` to create and \`edit\` to modify a file.
Use opencode's native \`skill\` tool to list and load skills.`;

export const SuperpowersPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  // `__dirname` is `.opencode/plugins/`, so the skills dir is two levels up.
  const superpowersSkillsDir = path.resolve(__dirname, '../../skills');
  const envConfigDir = process.env.OPENCODE_CONFIG_DIR
    ? process.env.OPENCODE_CONFIG_DIR.replace(/^~/, homeDir)
    : null;
  const configDir = envConfigDir || path.join(homeDir, '.config/opencode');

  const getBootstrapContent = () => {
    if (_bootstrapCache !== undefined) return _bootstrapCache;

    const skillPath = path.join(superpowersSkillsDir, 'using-superpowers', 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      _bootstrapCache = null;
      return null;
    }

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);

    _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;

    return _bootstrapCache;
  };

  return {
    // Register the skills directory into the live config so OpenCode discovers
    // every core skill without a manual skills.paths entry or symlink.
    // config.get() returns a cached object, so the mutation is visible when
    // skills are lazily discovered later in the same session.
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }
    },

    // Inject the bootstrap as a user message at the start of the session.
    // opencode reloads messages from storage on every agent step, and the
    // transform runs on each step, so the dedup guard below prevents the
    // bootstrap from being prepended more than once.
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find((m) => m.info && m.info.role === 'user');
      if (!firstUser || !firstUser.parts || !firstUser.parts.length) return;

      const alreadyInjected = firstUser.parts.some(
        (p) => p.type === 'text' && typeof p.text === 'string' && p.text.includes('EXTREMELY_IMPORTANT')
      );
      if (alreadyInjected) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};

export default SuperpowersPlugin;
