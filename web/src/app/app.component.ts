import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import { Pipeline } from './model/pipeline';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  private pipelines: Pipeline[] = [];

  constructor(private http: Http) {
    this.http.get('http://localhost:8000/hosts.json')
      .map(result => result.json())
      .subscribe(hosts => {
        this.initPipelines(hosts);
      });
  }

  private addHost(host, pipelines) {
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

  initPipelines(hosts: string[]) {
    this.pipelines = [];

    Observable.from(hosts)
      .flatMap(host => this.getPipelines(host), this.addHost)
      .flatMap( pipelinesData => Observable.from(pipelinesData))
      .map( rawData => new Pipeline(rawData) )
      .flatMap( (pipeline: Pipeline) => this.getStatus(pipeline), this.concatPipelineAndStatus)
      .flatMap( (pipeline: Pipeline) => this.getMetrics(pipeline), this.concatPipelineAndMetric)
      .map(this.refinePipelineMetrics)
      .subscribe( (pipeline: Pipeline) => {
        this.pipelines.push(pipeline);
      });
  }

  private getPipelines(host: String){
    const url = `http://localhost:8000/api?host=${host}&path=/pipelines`;
    return this.http.get(url).map( result => {
      return result.json();
    });
  }

  private getMetrics(pipeline: Pipeline){
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

  private getStatus(pipeline: any){
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
        "errorRate": {
          "1m": metrics['meters']['pipeline.batchErrorRecords.meter']['m1_rate'].toFixed(1),
          "5m": metrics['meters']['pipeline.batchErrorRecords.meter']['m5_rate'].toFixed(1),
          "1h": metrics['meters']['pipeline.batchErrorRecords.meter']['h1_rate'].toFixed(1),
          "24h": metrics['meters']['pipeline.batchErrorRecords.meter']['h24_rate'].toFixed(1)
        },
        "recordRate": {
          "1m": metrics['meters']['pipeline.batchInputRecords.meter']['m1_rate'].toFixed(1),
          "5m": metrics['meters']['pipeline.batchInputRecords.meter']['m5_rate'].toFixed(1),
          "1h": metrics['meters']['pipeline.batchInputRecords.meter']['h1_rate'].toFixed(1),
          "24h": metrics['meters']['pipeline.batchInputRecords.meter']['h24_rate'].toFixed(1)
        },
        "jvm": {
          "heapUsed": (metrics['gauges']['jvm.memory.heap.used']['value'] / 1024 / 1024 | 0) + 'MB'
        }
      };
    }
  }
}
