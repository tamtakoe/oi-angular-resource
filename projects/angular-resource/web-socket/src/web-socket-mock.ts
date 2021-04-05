export class WebSocketMock {
  url: string | undefined;
  protocols: string[] | undefined;
  readyState = 0;
  binaryType: any;
  extensions: any[] | undefined;
  protocol: string | undefined;

  private $url;
  private $intervalId;
  private $errorCount = 0;

  constructor(url: string, protocols?: string[]) {
    this.$url = url;

    setTimeout(() => {
      this.readyState = 1;
      this.onopen();
    }, 200);

    this.$intervalId = setInterval(() => {
      if (this.$errorCount < 5) {
        this.$errorCount++;

        this.onmessage({
          data: Math.random()
        });

      } else {
        this.$errorCount = 0;

        this.onerror({
          message: 'Error ' + Math.random()
        });
      }

    }, 1000);
  }

  onopen() {}

  onclose(event: any) {};

  onmessage(event: any) {};

  onerror(error: any) {};

  close() {
    this.readyState = 2;
    setTimeout(() => {
      clearInterval(this.$intervalId);

      this.readyState = 3;
      this.onclose({
        code: 1,
        reason: 'smth',
        wasClean: true
      });
    }, 50);
  }

  send(data: any) {
    if (this.readyState !== 1) {
      throw new Error('VM421:2 WebSocket is already in CLOSING or CLOSED state.');
    }

    setTimeout(() => {
      this.onmessage({
        data: 'Data were sent',
        payload: data
      });
    }, 100);
  }
}
