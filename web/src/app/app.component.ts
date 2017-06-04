import { Component } from '@angular/core';
import { Http } from "@angular/http";
import { Observable } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  /**
  status = []
  **/
  private status = [];
  private hosts = [];

  constructor(private http: Http){

    // setInterval( () => {
    this.http.get('http://localhost:8000/hosts.json')
      .map(result => result.json() )
      .subscribe( hosts => {
        this.hosts = hosts;
      });
    //     pipelineGroups.forEach( pipelineGroup => {
    //       let group = {"name": pipelineGroup.name, pipelines: []};
    //       this.status.push(group);
    //
    //       pipelineGroup.pipelines.forEach(pipeline => {
    //         this.getStatus(pipeline.host, pipeline.id ).subscribe( status => {
    //           let pipelineStatus = {
    //             "host": pipeline.host,
    //             "status": status.status,
    //             "metrics": this.parseMetrics(status.metrics)
    //           }
    //           group.pipelines.push( pipelineStatus );
    //           if ( !pipelineStatus.metrics ){
    //             this.getMetrics(pipeline.host, pipeline.id ).subscribe( metrics => {
    //                 pipelineStatus.metrics = this.parseMetrics(metrics);
    //             });
    //           }
    //         })
    //       })
    //     })
    //   })
    // }, 5000);

      // this.pipelineGroups = pipelineGroups;
      // pipelineGroups.forEach( pipelineGroup => {
      //   pipelineGroup.pipelines.map( (pipeline) => {
      //     let url = `http://localhost:8000/status?host=${pipeline.host}&pipelineId=${pipeline.pipelineId}`;
      //
      //     this.http.get(url).subscribe( result => {
      //       if ( !this.status[pipelineGroup.name] ) {
      //         this.status[pipelineGroup.name] = {};
      //       }
      //       let beforeTransform = result.json();
      //       beforeTransform['metrics'] = JSON.parse(beforeTransform['metrics']);
      //       this.status[pipelineGroup.name][pipeline.pipelineId] = beforeTransform;
      //     })
      //   })
      // })
  }

  hostStatus() {
    this.hosts.map( host => {
      this.getPipelines(host).subscribe( pipelines => {
        console.log( host);
        console.log( pipelines );
      });
    })
  }


  getPipelines(host: String){
    let url = `http://localhost:8000/metrics?host=${host}$path=/pipelines`;
    return this.http.get(url).map( result => {
      return result.json();
    });
  }

  getMetrics(host: String, pipelineId: String){
    let url = `http://localhost:8000/metrics?host=${host}&pipelineId=${pipelineId}`;
    return this.http.get(url).map( result => {
      return result.json()
    })
  }

  getStatus(host: String, pipelineId: String){
    let url = `http://localhost:8000/status?host=${host}&pipelineId=${pipelineId}`;
    return this.http.get(url).map( result => {
      let transformedData = result.json();
      transformedData['metrics'] = JSON.parse(transformedData['metrics']);
      return transformedData;
    })
  }

  parseMetrics(metrics: any){
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
      }
    }
  }
}
