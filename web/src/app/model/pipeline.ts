import {Status} from './status';

export class Pipeline{

  pipelineId: string;
  host: string;
  title: string;
  description: string;
  status: Status;
  metrics: any;
  lastModified: number;
  valid: boolean;
  metadata: any;

  state: string;

  constructor(rawData: any){
    this.pipelineId = rawData.pipelineId;
    this.host = rawData.host;
    this.title = rawData.title;
    this.description = rawData.description;
  }

  isWarningStatus(){
    return !![Status.START_ERROR, Status.EDITED].indexOf(this.status);
  }

}
