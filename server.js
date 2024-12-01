const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken'); 

const PROTO_PATH = './calculator.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator;
//Преобразует определение из .proto в объект, который можно использовать для создания серверов и клиентов.

const SECRET_KEY = 'jze8ldn#fa12hd';

function login(call, callback) {
  const { username, password } = call.request;

  if (username === 'user' && password === '1234') {
    const payload = { userId: '1', username: 'user' };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });  // Генерация токена
    callback(null, { token });
  } else {
    callback({
      code: grpc.status.UNAUTHENTICATED,
      details: 'Invalid username or password'
    });
  }
}

function authenticate(call, callback) {
  const metadata = call.metadata.get('authorization'); // Получаем токен из метаданных
  if (!metadata || metadata.length === 0) {
    callback({
      code: grpc.status.UNAUTHENTICATED,
      details: 'Missing or invalid authorization token'
    });
    return false;
  }

  try {
    const token = metadata[0]; // Токен из метаданных
    const decoded = jwt.verify(token, SECRET_KEY); // Проверка токена
    call.user = decoded; // Сохраняем информацию о пользователе
    return true;
  } catch (err) {
    callback({
      code: grpc.status.UNAUTHENTICATED,
      details: 'Invalid authorization token'
    });
    return false;
  }
}

function add(call, callback) {
  if (!authenticate(call, callback)) return; 
  const { number1, number2 } = call.request;
  callback(null, { value: number1 + number2 });
}

function mul(call, callback) {
  if (!authenticate(call, callback)) return; 

  const { number1, number2 } = call.request;
  callback(null, { value: number1 * number2 });
}

function sub(call, callback) {
  const { number1, number2 } = call.request;
  callback(null, { value: number1 - number2 });
}

function div(call, callback) {
    const { number1, number2 } = call.request;
    if(number2 == 0) callback({message:"error devision by 0"}, null);
  callback(null, { value: number1 / number2 });
}

function pow(call, callback) {
  const { number1, number2} = call.request;
  callback(null, { value: Math.pow(number1, number2) });
}

async function testDeadline(call, callback) {
  await sleep(1000);

  const {number1, number2 } = call.request;

  callback(null, {value: "testDeadline успешно выполнен: " + number1 + " + " + number2 + " = " + (number1 + number2)});
}

function main() {
  const server = new grpc.Server();

  server.addService(calculatorProto.CalculatorService.service, {
    Add: add,
    Mul: mul,
    Sub: sub,
    Div: div,
    Pow: pow,
    TestDeadline: testDeadline,
    Login: login
  });
  
  const address = '127.0.0.1:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server running at ${address}`);
  });
  //Привязывает сервер к указанному адресу (0.0.0.0:50051).
  //grpc.ServerCredentials.createInsecure() создаёт незащищённые учётные данные для тестового использования.
}

main();


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}