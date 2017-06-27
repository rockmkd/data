export enum Status{
  STARTING,
  RUNNING,
  STOPPING,
  STOPPED,
  EDITED,
  START_ERROR,
  RETRY
}

export namespace Status{

  export function noting(status: Status){
    switch (status) {
      case Status.EDITED:
      case Status.STOPPING:
      case Status.STOPPED:
      case Status.STARTING:
        return true;
      default:
        return false;
    }
  }

  export function healthy(status: Status){
    switch (status) {
      case Status.RUNNING:
          return true;
      default:
        return false;
    }
  }

  export function statusChanging(status: Status){
    switch (status) {
      case Status.STARTING:
      case Status.STOPPING:
      case Status.RETRY:
        return true;
      default:
        return false;
    }
  }
}

