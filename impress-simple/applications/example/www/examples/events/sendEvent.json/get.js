(client, callback) => {
  application.frontend.emit('test', { data: 'data' });
  callback('ok');
}