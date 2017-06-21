import {Pipeline} from '../../model/pipeline';
import {Component, Input, OnInit, Pipe} from "@angular/core";
import {Http} from "@angular/http";
import {Status} from "../../model/status";

@Component({
  selector: 'pipeline-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.css']
})
export class CommandComponent implements OnInit{

  @Input()
  private pipeline: Pipeline;
  private apiURL: ApiUrl;

  constructor(private http: Http){
  }

  ngOnInit(){
    this.apiURL = new ApiUrl(this.pipeline.host, this.pipeline.pipelineId);
  }

  startPipeline(){
    this.statusChange(this.apiURL.start())
  }

  stopPipeline(){
    this.statusChange(this.apiURL.stop())
  }

  statusChange(api: any){
    this.http[api.method](api.url)
      .subscribe(
        success => console.log(success.json()),
        err => alert(err)
      );
    this.statusCheck()
  }

  statusCheck(){
    const api = this.apiURL.status();

    this.http[api.method](api.url)
      .map( response => response.json() )
      .subscribe( result => {
        this.pipeline.status = <Status>result.status;
        if ( Status.statusChaning(this.pipeline.status) ){
          setTimeout( () => this.statusCheck(), 1000 );
        }
      });
  }

  isStarting(){
    return this.pipeline.status == Status.STARTING;
  }

  isStopping(){
    return this.pipeline.status == Status.STOPPING;
  }
}

class ApiUrl {
  private BASE_URL;

  constructor(private host: string, private pipelineId: string){
    this.BASE_URL = `http://localhost:8000/api?host=${host}&path=/pipeline/${pipelineId}`;
  }

  start(){
    return { url: this.BASE_URL+ '/start', method: 'post' }
  }

  stop(){
    return { url: this.BASE_URL+ '/stop', method: 'post' }
  }

  status(){
    return { url: this.BASE_URL+ '/status', method: 'get' }
  }
}
