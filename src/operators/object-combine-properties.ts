import { Dependency } from '../dependency';
import { Store } from '../store';

export class ObjectCombinePropertiesStore<T extends {}> extends Store<T> {
    private dependency: Dependency<{ [Key in keyof T]: Store<T[Key]> }>;
    private dependencies: { [Key: string]: Dependency<unknown> };
    private sources = {} as { [Key in keyof T]: Store<T[Key]> };

    public constructor(source: Store<{ [Key in keyof T]: Store<T[Key]> }>) {
        super(ObjectCombinePropertiesStore.combine(source.state));
        this.dependency = new Dependency(source, this.handleSourceNext);
        this.dependencies = {} as { [Key in keyof T]: Dependency<unknown> };
        for (const key of Object.keys(source.state)) {
            this.dependencies[key] = new Dependency<unknown>(source.state[key as keyof T] as Store<unknown>, this.handleNext);
        }
        this.sources = source.state;
    }

    protected preStart() {
        this.dependency.update();
        Dependency.updateAll(this.getDependenciesArray());
    }

    protected start() {
        this.dependency.start();
        Dependency.startAll(this.getDependenciesArray());
    }

    protected stop() {
        this.dependency.stop();
        Dependency.stopAll(this.getDependenciesArray());
    }

    private handleSourceNext = (newSources: { [Key in keyof T]: Store<T[Key]> }) => {
        const oldSources = this.sources;
        for (const key of Object.keys(oldSources)) {
            if (!(key in newSources) || oldSources[key as keyof T] !== newSources[key as keyof T]) {
                this.dependencies[key].stop();
                delete this.dependencies[key];
            }
        }
        this.sources = newSources;

        const newDependencies = {} as { [Key: string]: Dependency<unknown> };
        for (const key of Object.keys(newSources)) {
            if (key in this.dependencies) {
                newDependencies[key] = this.dependencies[key];
            } else {
                const dependency = new Dependency(newSources[key as keyof T] as Store<unknown>, this.handleNext);
                newDependencies[key] = dependency;
                dependency.start();
            }
        }
        this.dependencies = newDependencies;

        this.handleNext();
    }

    private handleNext = () => {
        this.setInnerState(ObjectCombinePropertiesStore.combine(this.sources));
    }

    private getDependenciesArray() {
        return Object.keys(this.dependencies).map((key) => this.dependencies[key]);
    }

    private static combine<T extends { [Key: string]: unknown }>(sources: { [Key in keyof T]: Store<T[Key]> }): T {
        const values = {} as T;
        for (const key of Object.keys(sources)) {
            values[key as keyof T] = sources[key].state;
        }
        return values;
    }
}

export const objectCombineProperties = <T extends {}>(source: Store<{ [Key in keyof T]: Store<T[Key]> }>): ObjectCombinePropertiesStore<T> => {
    return new ObjectCombinePropertiesStore(source);
};
