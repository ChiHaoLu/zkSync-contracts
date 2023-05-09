import yargs from "yargs"
import { HARDHAT_PARAM_DEFINITIONS } from "hardhat/internal/core/params/hardhat-params"
import { runScriptWithHardhat } from "hardhat/internal/util/scripts-runner"
import { HardhatArguments } from "hardhat/types/runtime"

async function hardhatRunWithArgs() {
    const hardhatArgv = {} as HardhatArguments
    const yargv = yargs.argv
    for (const arg of Object.keys(yargv)) {
        if (arg in HARDHAT_PARAM_DEFINITIONS) {
            hardhatArgv[arg] = yargv[arg]
        }
    }
    process.exitCode = await runScriptWithHardhat(hardhatArgv, process.argv[2], process.argv)
}

hardhatRunWithArgs().catch((e) => {
    console.error(e.message)
    process.exit(1)
})