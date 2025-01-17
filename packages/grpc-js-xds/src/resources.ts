/*
 * Copyright 2021 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// This is a non-public, unstable API, but it's very convenient
import { loadProtosWithOptionsSync } from '@grpc/proto-loader/build/src/util';
import { Cluster__Output } from './generated/envoy/config/cluster/v3/Cluster';
import { ClusterLoadAssignment__Output } from './generated/envoy/config/endpoint/v3/ClusterLoadAssignment';
import { Listener__Output } from './generated/envoy/config/listener/v3/Listener';
import { RouteConfiguration__Output } from './generated/envoy/config/route/v3/RouteConfiguration';
import { HttpConnectionManager__Output } from './generated/envoy/extensions/filters/network/http_connection_manager/v3/HttpConnectionManager';

export const EDS_TYPE_URL_V2 = 'type.googleapis.com/envoy.api.v2.ClusterLoadAssignment';
export const CDS_TYPE_URL_V2 = 'type.googleapis.com/envoy.api.v2.Cluster';
export const LDS_TYPE_URL_V2 = 'type.googleapis.com/envoy.api.v2.Listener';
export const RDS_TYPE_URL_V2 = 'type.googleapis.com/envoy.api.v2.RouteConfiguration';

export const EDS_TYPE_URL_V3 = 'type.googleapis.com/envoy.config.endpoint.v3.ClusterLoadAssignment';
export const CDS_TYPE_URL_V3 = 'type.googleapis.com/envoy.config.cluster.v3.Cluster';
export const LDS_TYPE_URL_V3 = 'type.googleapis.com/envoy.config.listener.v3.Listener';
export const RDS_TYPE_URL_V3 = 'type.googleapis.com/envoy.config.route.v3.RouteConfiguration';

export type EdsTypeUrl = 'type.googleapis.com/envoy.api.v2.ClusterLoadAssignment' | 'type.googleapis.com/envoy.config.endpoint.v3.ClusterLoadAssignment';
export type CdsTypeUrl = 'type.googleapis.com/envoy.api.v2.Cluster' | 'type.googleapis.com/envoy.config.cluster.v3.Cluster';
export type LdsTypeUrl = 'type.googleapis.com/envoy.api.v2.Listener' | 'type.googleapis.com/envoy.config.listener.v3.Listener';
export type RdsTypeUrl = 'type.googleapis.com/envoy.api.v2.RouteConfiguration' | 'type.googleapis.com/envoy.config.route.v3.RouteConfiguration';

export type AdsTypeUrl = EdsTypeUrl | CdsTypeUrl | RdsTypeUrl | LdsTypeUrl;

export const HTTP_CONNECTION_MANGER_TYPE_URL_V2 =
  'type.googleapis.com/envoy.config.filter.network.http_connection_manager.v2.HttpConnectionManager';
export const HTTP_CONNECTION_MANGER_TYPE_URL_V3 =
  'type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager';

export type HttpConnectionManagerTypeUrl = 'type.googleapis.com/envoy.config.filter.network.http_connection_manager.v2.HttpConnectionManager' | 'type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager';

/**
 * Map type URLs to their corresponding message types
 */
export type AdsOutputType<T extends AdsTypeUrl | HttpConnectionManagerTypeUrl> = T extends EdsTypeUrl
  ? ClusterLoadAssignment__Output
  : T extends CdsTypeUrl
  ? Cluster__Output
  : T extends RdsTypeUrl
  ? RouteConfiguration__Output
  : T extends LdsTypeUrl
  ? Listener__Output
  : HttpConnectionManager__Output;

const resourceRoot = loadProtosWithOptionsSync([
  'envoy/config/listener/v3/listener.proto', 
  'envoy/config/route/v3/route.proto',
  'envoy/config/cluster/v3/cluster.proto',
  'envoy/config/endpoint/v3/endpoint.proto',
  'envoy/extensions/filters/network/http_connection_manager/v3/http_connection_manager.proto'], {
    keepCase: true,
    includeDirs: [
      // Paths are relative to src/build
      __dirname + '/../../deps/envoy-api/',
      __dirname + '/../../deps/xds/',
      __dirname + '/../../deps/googleapis/',
      __dirname + '/../../deps/protoc-gen-validate/',
    ],
  }
);

const toObjectOptions = {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}

export function decodeSingleResource<T extends AdsTypeUrl | HttpConnectionManagerTypeUrl>(targetTypeUrl: T, message: Buffer): AdsOutputType<T> {
  const name = targetTypeUrl.substring(targetTypeUrl.lastIndexOf('/') + 1);
  const type = resourceRoot.lookup(name);
  if (type) {
    const decodedMessage = (type as any).decode(message);
    return decodedMessage.$type.toObject(decodedMessage, toObjectOptions) as AdsOutputType<T>;
  } else {
    throw new Error(`ADS Error: unknown resource type ${targetTypeUrl}`);
  }
}