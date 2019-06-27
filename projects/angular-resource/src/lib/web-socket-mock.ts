export class WebSocketMock {
  private _url;
  private _intervalId;
  private _errorCount = 0;

  url;
  protocols;

  bufferedAmount;
  readyState = 0;
  binaryType;
  extensions;
  protocol;

  constructor(url, protocols?) {
    this._url = url;

    setTimeout(() => {
      this.readyState = 1;
      this.onopen();
    }, 200);

    this._intervalId = setInterval(() => {
      if (this._errorCount < 5) {
        this._errorCount++;

        this.onmessage({
          data: Math.random()
        })

      } else {
        this._errorCount = 0;

        this.onerror({
          message: 'Error ' + Math.random()
        })
      }

    }, 1000)
  }

  onopen() {}

  onclose(event) {};

  onmessage(event) {};

  onerror(error) {};

  close() {
    this.readyState = 2;
    setTimeout(() => {
      clearInterval(this._intervalId);

      this.readyState = 3;
      this.onclose({
        code: 1,
        reason: 'smth',
        wasClean: true
      });
    }, 50);
  }

  send(data) {
    if (this.readyState !== 1) {
      throw new Error('VM421:2 WebSocket is already in CLOSING or CLOSED state.')
    }

    setTimeout(() => {
      this.onmessage({
        data: 'Data were sent',
        payload: data
      });
    }, 100);
  }
}
