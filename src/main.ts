const os = require('os');
const path = require('path');

const download = require('download');

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import {getOptions} from './args';

async function getCargo(): Promise<string> {
    try {
        return await io.which('cargo', true);
    } catch (error) {
        core.info('cargo is not installed by default for some virtual environments, \
see https://help.github.com/en/articles/software-in-virtual-environments-for-github-actions');
        core.info('To install it, use this action: https://github.com/actions-rs/toolchain');

        throw error;
    }
}

async function run() {
    const {version} = await getOptions();
    const cargo = await getCargo();
    const cargoExecutableDir = path.dirname(cargo);

    const outputDir = `${os.tmpdir()}/tarpaulin/${version}`;
    await io.mkdirP(outputDir);

    const archiveName = `cargo-tarpaulin-${version}-travis.tar.gz`;
    const archiveUrl = `https://github.com/xd009642/tarpaulin/releases/download/${version}/${archiveName}`;

    core.info(`[tarpaulin] downloading cargo-tarpaulin ${version} from ${archiveUrl}`);

    await download(archiveUrl, outputDir, {
        followRedirect: true,
    });

    core.info(`[tarpaulin] extracting to ${outputDir}`);

    await exec.exec('tar', ['-C', cargoExecutableDir, '-xf', `${outputDir}/${archiveName}`]);

    core.info(`[tarpaulin] running tests with coverage tracking`);

    await exec.exec(cargo, [
        'tarpaulin',
        '--out', 'Xml'
    ]);
}

async function main() {
    try {
        await run();
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
