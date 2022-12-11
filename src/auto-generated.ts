
const runTimeDependencies = {
    "externals": {
        "@youwol/cdn-client": "^1.0.9",
        "@youwol/pyodide-helpers": "^0.1.0",
        "rxjs": "^6.5.5"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/cdn-client": {
        "commonjs": "@youwol/cdn-client",
        "commonjs2": "@youwol/cdn-client",
        "root": "@youwol/cdn-client_APIv1"
    },
    "@youwol/pyodide-helpers": {
        "commonjs": "@youwol/pyodide-helpers",
        "commonjs2": "@youwol/pyodide-helpers",
        "root": "@youwol/pyodide-helpers_APIv01"
    },
    "rxjs": {
        "commonjs": "rxjs",
        "commonjs2": "rxjs",
        "root": "rxjs_APIv6"
    },
    "rxjs/operators": {
        "commonjs": "rxjs/operators",
        "commonjs2": "rxjs/operators",
        "root": [
            "rxjs_APIv6",
            "operators"
        ]
    }
}
const exportedSymbols = {
    "@youwol/cdn-client": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/cdn-client"
    },
    "@youwol/pyodide-helpers": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/pyodide-helpers"
    },
    "rxjs": {
        "apiKey": "6",
        "exportedSymbol": "rxjs"
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types -- allow to allow no secondary entries
const mainEntry : Object = {
    "entryFile": "./index.ts",
    "loadDependencies": [
        "@youwol/cdn-client",
        "@youwol/pyodide-helpers",
        "rxjs"
    ]
}

// eslint-disable-next-line @typescript-eslint/ban-types -- allow to allow no secondary entries
const secondaryEntries : Object = {}
const entries = {
     '@youwol/pyodide-cdn-package-template': './index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/pyodide-cdn-package-template/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/pyodide-cdn-package-template',
        assetId:'QHlvdXdvbC9weW9kaWRlLWNkbi1wYWNrYWdlLXRlbXBsYXRl',
    version:'0.1.0-wip',
    shortDescription:"",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/pyodide-cdn-package-template',
    npmPackage:'https://www.npmjs.com/package/@youwol/pyodide-cdn-package-template',
    sourceGithub:'https://github.com/youwol/pyodide-cdn-package-template',
    userGuide:'https://l.youwol.com/doc/@youwol/pyodide-cdn-package-template',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{cdnClient, installParameters?}) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry['loadDependencies'].map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/pyodide-cdn-package-template_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{name: string, cdnClient, installParameters?}) => {
        const entry = secondaryEntries[name]
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/pyodide-cdn-package-template#0.1.0-wip~dist/@youwol/pyodide-cdn-package-template/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/pyodide-cdn-package-template/${entry.name}_APIv01`]
        })
    }
}
