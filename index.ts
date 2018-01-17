// import { lineString, point, featureCollection } from '@turf/helpers'
import { BufferReader } from 'protobufjs/light'
import {
  SharedStreetsGeometry,
  ISharedStreetsGeometry as SharedStreetsGeometryPbf,
  SharedStreetsIntersection,
  ISharedStreetsIntersection as SharedStreetsIntersectionPbf,
  SharedStreetsReference,
  ISharedStreetsReference as SharedStreetsReferencePbf,
  SharedStreetsMetadata,
  ISharedStreetsMetadata as SharedStreetsMetadataPbf,
} from './proto/sharedstreets'

export {
  SharedStreetsGeometryPbf,
  SharedStreetsIntersectionPbf,
  SharedStreetsReferencePbf,
  SharedStreetsMetadataPbf,
}

/**
 * Geometry Pbf
 *
 * Parser for SharedStreets Geometry Pbf Buffers
 *
 * @param {Buffer} buffer Pbf Buffer
 * @returns {Array<SharedStreetsGeometryPbf>} An Array of SharedStreet Geometry
 * @example
 * const buffer = fs.readFileSync('z-x-y.geometry.pbf')
 *
 * const geoms = sharedstreetsPbf.geometry(buffer)
 * geoms[0].id // => 'NxPFkg4CrzHeFhwV7Uiq7K'
 */
export function geometry (buffer: Buffer | Uint8Array) {
  return readBuffer<SharedStreetsGeometryPbf>(buffer, SharedStreetsGeometry)
}

/**
 * Intersection Pbf
 *
 * Parser for SharedStreets Intersection Pbf Buffers
 *
 * @param {Buffer} buffer Pbf Buffer
 * @returns {Array<SharedStreetsIntersectionPbf>} An Array of SharedStreet Intersections
 * @example
 * const buffer = fs.readFileSync('z-x-y.intersection.pbf')
 *
 * const intersections = sharedstreetsPbf.intersection(buffer)
 * intersections[0].id // => 'NxPFkg4CrzHeFhwV7Uiq7K'
 */
export function intersection (buffer: Buffer | Uint8Array) {
  return readBuffer<SharedStreetsIntersectionPbf>(buffer, SharedStreetsIntersection)
}

/**
 * Reference Pbf
 *
 * Parser for SharedStreets Reference Pbf Buffers
 *
 * @param {Buffer} buffer Pbf Buffer
 * @returns {Array<SharedStreetsReferencePbf>} An Array of SharedStreet References
 * @example
 * const buffer = fs.readFileSync('z-x-y.reference.pbf')
 *
 * const references = sharedstreetsPbf.reference(buffer)
 * references[0].id // => 'Bg1tCb7pjpb9Z8RZVGqBtK'
 */
export function reference (buffer: Buffer | Uint8Array) {
  return readBuffer<SharedStreetsReferencePbf>(buffer, SharedStreetsReference)
}

/**
 * Metadata Pbf
 *
 * Parser for SharedStreets Metadata Pbf Buffers
 *
 * @param {Buffer} buffer Pbf Buffer
 * @returns {Array<SharedStreetsMetadataPbf>} An Array of SharedStreet Metadatas
 * @example
 * const buffer = fs.readFileSync('z-x-y.metadata.pbf')
 *
 * const metadatas = sharedstreetsPbf.metadata(buffer)
 * metadatas[0].geometryID // => 'HGdvAjtekfDrLFzPevNtf3'
 */
export function metadata (buffer: Buffer | Uint8Array) {
  return readBuffer<SharedStreetsMetadataPbf>(buffer, SharedStreetsMetadata)
}

function readBuffer<T = any>(buffer: Buffer | Uint8Array, parser: any): T[] {
  const results = []
  const reader = new BufferReader(buffer)
  while (reader.pos < reader.len) {
    const result: any = parser.decodeDelimited(reader).toJSON()
    results.push(result)
  }
  return results
}
