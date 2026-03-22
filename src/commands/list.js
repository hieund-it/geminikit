/**
 * gk list — prints a table of available agents and skills
 * found in the .gemini/ directory of the current project.
 */

const fs = require('fs')
const path = require('path')
const pc = require('picocolors')
const { intro, outro, log } = require('@clack/prompts')

module.exports = function list() {
  const geminiDir = path.join(process.cwd(), '.gemini')

  intro('[>] GeminiKit CLI - List')

  if (!fs.existsSync(geminiDir)) {
    log.warn('No .gemini/ found in this directory. Run gk init first.')
    return
  }

  let found = false

  // List agents (each is a .md file in .gemini/agents/)
  const agentsDir = path.join(geminiDir, 'agents')
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
      .sort()

    if (agents.length > 0) {
      console.log(pc.bold('\nAgents:'))
      agents.forEach(a => console.log(`  ${pc.cyan('•')} ${a}`))
      found = true
    }
  }

  // List skills (each is a subdirectory in .gemini/skills/)
  const skillsDir = path.join(geminiDir, 'skills')
  if (fs.existsSync(skillsDir)) {
    const skills = fs.readdirSync(skillsDir)
      .filter(f => {
        try { return fs.lstatSync(path.join(skillsDir, f)).isDirectory() }
        catch { return false }
      })
      .sort()

    if (skills.length > 0) {
      console.log(pc.bold('\nSkills:'))
      skills.forEach(s => console.log(`  ${pc.cyan('•')} ${s}`))
      found = true
    }
  }

  if (!found) {
    log.warn('No agents or skills found in .gemini/')
    return
  }

  outro('Done')
}
