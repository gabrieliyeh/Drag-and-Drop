import { Component } from "./base-components";
import { Project, ProjectStatus } from "../models/project";
import { DragTarget } from "../models/drag-drop";
import { autoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-items";
   export class ProjectList extends Component <HTMLTemplateElement,HTMLElement > implements DragTarget {
        assignedProjects: Project[]
        constructor(private type: 'active' | 'finished') {
            super("project-list", 'app',false, `${type}-projects`);
              this.assignedProjects = []
              this.configure()
              this.renderContent() 
        }
        @autoBind
        dragOverHandler(event: DragEvent){
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
                event.preventDefault()
                const listEl = this.element.querySelector('ul')!;
                listEl.classList.add('droppable')
            }
        }
        @autoBind
        dropHandler(event: DragEvent) {
          const prjId = event.dataTransfer!.getData('text/plain');
          projectState.moveProject(prjId, this.type === 'active' ?  ProjectStatus.Active : ProjectStatus.Finished )
    
        }
        @autoBind
        dragLeaveHandler(_: DragEvent){
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable')
        }
    
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler)
            this.element.addEventListener('dragleave', this.dragLeaveHandler)
            this.element.addEventListener('drop', this.dropHandler)
            projectState.addListener((projects:Project[])=>{
                const relevantProjects = projects.filter((project)=> {
                    if(this.type === 'active'){
                        return project.status === ProjectStatus.Active
                    }
                    return project.status === ProjectStatus.Finished
                })
                this.assignedProjects = relevantProjects
                this.renderProjects()
              })
        }
         renderContent(){
            const listId = `${this.type}-projects-list`
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' Projects';
        } 
    
      private  renderProjects(){
            const listElement = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
             listElement.innerHTML = ''
            for(const prjItem of this.assignedProjects){
                new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
            }
        }
    }
