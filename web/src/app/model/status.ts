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
  export function warning(status: Status){
    switch (status) {
      case Status.START_ERROR:
      case Status.RETRY:
      case Status.EDITED:
        return true;
      default:
        return false;
    }
  }

  export function statusChaning(status: Status){
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

