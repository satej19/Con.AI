import { IProject } from '../models/Project.model';
import { PaginationMeta } from '../utils/pagination';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '../validators/project.validator';
export declare const createProject: (input: CreateProjectInput) => Promise<IProject>;
export declare const getProjects: (query: ProjectQueryInput) => Promise<{
    projects: IProject[];
    meta: PaginationMeta;
}>;
export declare const getProjectById: (id: string) => Promise<IProject>;
export declare const updateProject: (id: string, input: UpdateProjectInput) => Promise<IProject>;
//# sourceMappingURL=project.service.d.ts.map