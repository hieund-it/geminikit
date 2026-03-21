/**
 * gk list — prints a table of available agents and skills
 * found in the .gemini/ directory of the current project.
 */

const fs = require('fs')
const path = require('path')
const pc = require('picocolors')

module.exports = function list() {
  const geminiDir = path.join(process.cwd(), '.gemini')

  if (!fs.existsSync(geminiDir)) {
    console.log(pc.yellow('No .gemini/ found in this directory. Run gk init first.'))
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
      .filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory())
      .sort()

    if (skills.length > 0) {
      console.log(pc.bold('\nSkills:'))
      skills.forEach(s => console.log(`  ${pc.cyan('•')} ${s}`))
      found = true
    }
  }

  if (!found) {
    console.log(pc.yellow('No agents or skills found in .gemini/'))
    return
  }

  console.log()
}
