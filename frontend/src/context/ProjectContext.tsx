import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project } from '../types';
import { api } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string; // 'all' or specific project _id
  selectedProject: Project | null;
  setSelectedProjectId: (id: string) => void;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/projects', { limit: 100 });
      if (res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.projects || [];
        setProjects(list);
      }
    } catch (err) {
      console.warn('Could not fetch projects list:', err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const selectedProject =
    selectedProjectId === 'all'
      ? null
      : projects.find((p) => p._id === selectedProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        selectedProject,
        setSelectedProjectId,
        isLoading,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
