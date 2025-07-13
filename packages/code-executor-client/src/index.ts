// Export types
export * from './types';

// Export clients
export { RestClient, execCodeRest } from './rest-client';
export { GrpcClient, execCodeGrpc } from './grpc-client';

// Default export for convenience
export default {
  execCodeRest: require('./rest-client').execCodeRest,
  execCodeGrpc: require('./grpc-client').execCodeGrpc,
  RestClient: require('./rest-client').RestClient,
  GrpcClient: require('./grpc-client').GrpcClient,
};
