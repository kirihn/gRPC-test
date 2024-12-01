const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const PROTO_PATH = './calculator.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator;

function main(token) {
  const client = new calculatorProto.CalculatorService('127.0.0.1:50051', grpc.credentials.createInsecure());

  const metadata = new grpc.Metadata();
  metadata.add('authorization', token);

  client.Add({ number1: 5, number2: 3 },  (err, response) => { //+
    if (err) {
      console.error('Error Add:', err.details);
    } else {
      console.log(`Add: ${response.value}`);
    }
  });

  client.Mul({ number1: 5, number2: 3 }, metadata, (err, response) => { // *
    if (err) {
      console.error('Error Mul:', err.details);
    } else {
      console.log(`Mul: ${response.value}`);
    }
  });

  client.Sub({ number1: 5, number2: 3 }, (err, response) => { // -
    if (err) {
      console.error('Error Sub:', err.details);
    } else {
      console.log(`Sub: ${response.value}`);
    }
  });

  client.Div({ number1: 5, number2: 2 }, (err, response) => { // /
    if (err) {
      console.error('Error Div:', err.details);
    } else {
      console.log(`Div: ${response.value}`);
    }
  });

  client.Pow({ number1: 5, number2: 3 }, (err, response) => { // ^
    if (err) {
      console.error('Error Pow:', err.details);
    } else {
      console.log(`Pow: ${response.value}`);
    }
  });

  ///////////////////////////////////////////////////////////////////

  const deadline = Date.now() + 3000; // 3 секунды

  client.TestDeadline({ number1: 5, number2: 3 }, { deadline }, (err, response) => {
    if (err) {
      console.error('TestDeadline Error (timeout 3000):', err.details || err.message);
    } else {
      console.log(`TestDeadline (timeout 3000): ${response.value}`);
    }
  });

  const shortDeadline = Date.now() + 100; //  миллисекунда
  client.TestDeadline({ number1: 2, number2: 10 }, { deadline: shortDeadline }, (err, response) => {
    if (err) {
      console.error('TestDeadline Error (timeout 100):', err.details || err.message);
    } else {
      console.log(`TestDeadline (timeout 100): ${response.value}`);
    }
  });



}

function authenticate() {
  const client = new calculatorProto.CalculatorService('127.0.0.1:50051', grpc.credentials.createInsecure());
  client.Login({ username: 'user', password: '1234' }, (err, response) => {
    if (err) {
      console.error('Authentication failed:', err.details);
    } else {
      const token = response.token;
      console.log('Authenticated! Token:', token);

      main(token);
    }
  });


}

authenticate();

