import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import {concatMap} from "rxjs/operator/concatMap";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  private status = [];
  private hosts = [];
  private pipelines = [];

  constructor(private http: Http) {

    // setInterval( () => {
    this.http.get('http://localhost:8000/hosts.json')
      .map(result => result.json())
      .subscribe(hosts => {
        this.hosts = hosts;
        this.refreshStatus();
      });
  }

  _addHost(host, pipelines) {
    return pipelines.map( pipeline => {
      pipeline.host = host;
      return pipeline
    });
  }

  private concatPipelineAndStatus = (pipeline, status) => Object.assign(pipeline, status);

  private concatPipelineAndMetric = (pipeline, metric) => {
    if (!pipeline.metrics){
      pipeline.metrics = metric;
    }

    return pipeline;
  };

  private refinePipelineMetrics = pipeline => {
    if (pipeline.metrics){
      pipeline.metrics = this.parseMetrics(pipeline.metrics);
    }

    return pipeline;
  };

  refreshStatus() {
    this.pipelines = [];

    Observable.from(this.hosts)
      .flatMap(host => this.getPipelines(host), this._addHost)
      .flatMap(pipelines => Observable.from(pipelines))
      .flatMap(pipeline => this.getStatus(pipeline), this.concatPipelineAndStatus)
      .flatMap(pipeline => this.getMetrics(pipeline), this.concatPipelineAndMetric)
      .map(this.refinePipelineMetrics)
      .subscribe(pipeline => { this.pipelines.push(pipeline); console.log( this.pipelines )});


  }

  getPipelines(host: String){
    const url = `http://localhost:8000/api?host=${host}&path=/pipelines`;
    return this.http.get(url).map( result => {
      return result.json();
    });
  }

  getMetrics(pipeline: any){
    const host = pipeline.host;
    const id = pipeline.pipelineId;

    const url = `http://localhost:8000/api?host=${host}&path=/pipeline/${id}/metrics`;
    return this.http.get(url).map( result => {
      if ( result.text() ) {
        return result.json()
      }else{
        return ""
      }
    })
  }

  getStatus(pipeline: any){
    const host = pipeline.host;
    const id = pipeline.pipelineId;
    const url = `http://localhost:8000/api?host=${host}&path=/pipeline/${id}/status`;
    return this.http.get(url).map( result => {
      return result.json()
    }).map( status => {
      if ( status.metrics ){
        status.metrics = JSON.parse( status.metrics );
      }
      return status;
    })
  }

  private parseMetrics(metrics: any){
    if ( metrics ){
      return {
        "errorCount": {
          "1m": metrics['meters']['pipeline.batchErrorRecords.meter']['m1_rate'],
          "5m": metrics['meters']['pipeline.batchErrorRecords.meter']['m5_rate'],
          "1h": metrics['meters']['pipeline.batchErrorRecords.meter']['h1_rate'],
          "24h": metrics['meters']['pipeline.batchErrorRecords.meter']['h24_rate']
        },
        "recordCount": {
          "1m": metrics['meters']['pipeline.batchInputRecords.meter']['m1_rate'],
          "5m": metrics['meters']['pipeline.batchInputRecords.meter']['m5_rate'],
          "1h": metrics['meters']['pipeline.batchInputRecords.meter']['h1_rate'],
          "24h": metrics['meters']['pipeline.batchInputRecords.meter']['h24_rate']
        },
        "jvm": {
          "heapUsed": (metrics['gauges']['jvm.memory.heap.used']['value'] / 1024 / 1024 | 0) + 'MB'
        }
      };
    }
  }
}
