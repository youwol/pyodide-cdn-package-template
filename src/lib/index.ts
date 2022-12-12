import { IdeProject } from '@youwol/pyodide-helpers'
import { setup } from '../auto-generated'
import { BehaviorSubject, forkJoin } from 'rxjs'
import { filter, mergeMap, take } from 'rxjs/operators'
import { InstallDoneEvent, CdnEvent, CdnMessageEvent } from '@youwol/cdn-client'
/*
This demonstrates how to 'install' the library:
return async ({debug}) => {
    const CDN = window['@youwol/cdn-client']
    const {lib} = await CDN.install({
        modules:[
            '@youwol/pyodide-cdn-package-template'
        ],
        modulesSideEffects:{
            '@youwol/pyodide-cdn-package-template#*': async ({module, onEvent}) => {
                await module.install(onEvent)
            }
        },
        aliases:{
            lib : '@youwol/pyodide-cdn-package-template'
        },
        displayLoadingScreen: true
    })
    return await lib.projectState.run()
}
 */
export let projectState: IdeProject.ProjectState<IdeState> = undefined

class IdeState implements IdeProject.JsonModels.IdeState {
    public readonly fsMap$: BehaviorSubject<Map<string, string>>

    constructor({ files }: { files: { path: string; content: string }[] }) {
        const fsMap = new Map(files.map((file) => [file.path, file.content]))
        this.fsMap$ = new BehaviorSubject(fsMap)
    }
    public addFile() {
        /*no op*/
    }
    public removeFile() {
        /*no op*/
    }
    public moveFile() {
        /*no op*/
    }
    public update() {
        /*no op*/
    }
}

function isCdnMessageEvent(
    event: unknown,
): event is { id: string; workerId: string; text: string } {
    return event['id'] && event['text'] && event['workerId']
}

export async function install(onEvent?: (event: CdnEvent) => void) {
    if (projectState) {
        return projectState
    }
    const libraryId = window.btoa(setup.name)
    const url = `/api/assets-gateway/cdn-backend/resources/${libraryId}/${setup.version}/src/project.json`
    const project: IdeProject.JsonModels.Project = await fetch(url).then(
        (resp) => resp.json(),
    )

    const installDone$ = (
        state: IdeProject.EnvironmentState<
            IdeProject.ExecutingImplementation,
            IdeState
        >,
    ) => {
        return state.cdnEvent$.pipe(
            filter((event) => event instanceof InstallDoneEvent),
            take(1),
        )
    }

    return new Promise<IdeProject.ProjectState<IdeState>>((resolve) => {
        projectState = new IdeProject.ProjectState({
            project,
            createIdeState: (params) => new IdeState(params),
        })
        onEvent &&
            projectState.mainThreadState.cdnEvent$.subscribe((event) =>
                onEvent(event),
            )
        projectState.pyWorkersState$
            .pipe(
                mergeMap((workersPools) => {
                    const doneInstallWorkerPools = workersPools.map(
                        (workersPool) => {
                            onEvent &&
                                workersPool.cdnEvent$.subscribe((event) => {
                                    if (isCdnMessageEvent(event)) {
                                        onEvent(
                                            new CdnMessageEvent(
                                                `${event.workerId}_${event.id}`,
                                                `Worker ${event.workerId}:${event.text}`,
                                            ),
                                        )
                                    }
                                })
                            return installDone$(workersPool)
                        },
                    )
                    return forkJoin([
                        installDone$(projectState.mainThreadState),
                        ...doneInstallWorkerPools,
                    ])
                }),
            )
            .subscribe(() => {
                resolve(projectState)
            })
    })
}
