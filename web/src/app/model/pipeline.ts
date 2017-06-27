import {Status} from './status';

export class Pipeline{

  pipelineId: string;
  host: string;
  title: string;
  description: string;
  metrics: any;
  lastModified: number;
  valid: boolean;
  metadata: any;

  private status: Status;

  state: string;

  constructor(rawData: any){
    this.pipelineId = rawData.pipelineId;
    this.host = rawData.host;
    this.title = rawData.title;
    this.description = rawData.description;
  }

  setStatus(status: string){
    this.status = Status[status];
  }

  getStatus(){
    return this.status;
  }

  // FIXME 으..구리다.
  getStatusString(){
    return Status[this.status];
  }

  warningStatus(){
    // return this.notingStatus()
    // RETRY, START_ERROR
    return !(this.notingStatus() || this.healthyStatus());
  }

  notingStatus(){
    // console.log( this.status, Status[this.status],  [Status.STOPPING, Status.STOPPED, Status.EDITED]);
    // console.log( !this.healthyStatus() );
    // console.log( (Status[this.status] in [Status.STOPPING, Status.STOPPED, Status.EDITED]) )
    return !this.healthyStatus() && Status.noting(this.status);
  }

  changingStatus(){
    return Status.statusChanging(this.status);
  }

  private healthyStatus(){
    return Status.healthy(this.status);
  }
}
