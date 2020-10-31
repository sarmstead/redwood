import fs from 'fs'
import path from 'path'

import terminalLink from 'terminal-link'

import { runCommandTask, getPaths } from 'src/lib'

export const command = 'generate'
export const description = 'Generate the Prisma client'
export const builder = (yargs) => {
  yargs
    .option('force', {
      alias: 'f',
      default: true,
      description: 'Overwrite existing Client',
      type: 'boolean',
    })
    .option('verbose', {
      alias: 'v',
      default: true,
      description: 'Print more',
      type: 'boolean',
    })
    .option('schema', {
      alias: 's',
      default: true,
      description: 'Overwrite Prisma schema path',
      type: 'string',
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/reference/command-line-interface#db-generate'
      )}`
    )
}
export const handler = async ({ verbose = true, force = true }) => {
  if (!fs.existsSync(getPaths().api.dbSchema)) {
    console.log(
      `Skipping database and Prisma client generation, no \`schema.prisma\` file found: \`${
        getPaths().api.dbSchema
      }\``
    )
    return
  }

  // Do not generate the Prisma client if it exists.
  if (!force) {
    // The Prisma client throws if it is not generated.
    try {
      // Import the client from the redwood apps node_modules path.
      const { PrismaClient } = require(path.join(
        getPaths().base,
        'node_modules/.prisma/client'
      ))
      // eslint-disable-next-line
      new PrismaClient()
      return // Client exists, so abort.
    } catch (e) {
      // Swallow your pain, and generate.
    }
  }

  console.log('SCHEMA:', getPaths().api.dbSchema)

  return await runCommandTask(
    [
      {
        title: 'Generating the Prisma client...',
        cmd: 'yarn prisma generate',
        args: [`--schema=${getPaths().api.dbSchema}`],
      },
    ],
    {
      verbose,
    }
  )
}
