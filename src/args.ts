import * as core from '@actions/core';
import fetch from 'node-fetch';

// Workaround for a GH bug: https://github.com/actions/toolkit/issues/127
//
// For input `all-features: true` it will generate the `INPUT_ALL-FEATURES: true`
// env variable, which looks too weird.
// Here we are trying to get proper name `INPUT_NO_DEFAULT_FEATURES` first,
// and if it does not exist, trying the `INPUT_NO-DEFAULT-FEATURES`
function getInput(name: string, options?: core.InputOptions): string {
    const inputFullName = name.replace(/-/g, '_');
    let value = core.getInput(inputFullName, options);
    if (value.length > 0) {
        return value
    }

    return core.getInput(name)
}

function inputBoolean(name: string): boolean {
    const value = getInput(name);
    if (value == 'true' || value == '1') {
        return true;
    } else {
        return false;
    }
}

interface ActionInputs {
    version: string,
    releaseEndpoint: string,
}

async function determineVersion(releaseEndpoint: string, requestedVersion: string) {

}

/**
 * Determine the download version for the ZIP archive containing the `cargo-tarpaulin` binaries.
 *
 * @param requestedVersion The Git tag of the tarpaulin revision to get a download URL for. May be any valid Git tag,
 * or a special-cased `latest`.
 */
async function getDownloadUrl(releaseEndpoint: string, requestedVersion: string): Promise<string> {

        const releaseInfoRequest = await fetch(releaseEndpoint);
        const releaseInfo = await releaseInfoRequest.json();
        const releaseVersion = releaseInfo["tag_name"];

        return releaseInfo["https://github.com/xd009642/tarpaulin/releases/download/0.8.6/cargo-tarpaulin-0.8.6-travis.tar.gz"];
}

export async function getOptions(): Promise<TarpaulinOptions> {
    const requestedVersion = getInput('version');
    let version = requestedVersion;

    if (requestedVersion.match(/latest/i)) {
        core.info(`[tarpaulin] using latest release`);

        const releaseInfoResponse = await fetch
        const releaseInfo = await fetch("https://api.github.com/repos/xd009642/tarpaulin/releases/latest")
            .then(response => response.json());

        if ("tag_name" in releaseInfo) {
            version = releaseInfo["tag_name"];
        }

        core.info(`[tarpaulin] latest release is ${version}`);
    }

    return {
        version,
        downloadUrl,
    };
}

export interface TarpaulinOptions {
    /**
     * The Git tag of `cargo-tarpaulin` to do download release artifacts from.
     */
    version: string
}
