import { lineString, point, featureCollection } from '@turf/helpers'
import * as Pbf from 'pbf'

// Hack solution
// Parsing/encoding issue with SharedStreets PBF file
// https://github.com/sharedstreets/sharedstreets-js-pbf/issues/1
Pbf.prototype.readFields = function (readField, result, end) {
  end = end || this.length

  while (this.pos < end) {
    var val = this.readVarint()
    var tag = val >> 3
    // var startPos = this.pos

    this.type = val & 0x7
    readField(tag, result, this)

    // if (this.pos === startPos) this.skip(val)
  }
  return result
}

/**
 * Geometry Pbf
 *
 * Parser for SharedStreets Geometry Pbf Buffers
 *
 * @param {Buffer} buffer Pbf Buffer
 * @returns {FeatureCollection<LineString>} FeatureCollection of SharedStreets Geometries
 * @example
 * var buffer = fs.readFileSync('z-x-y.geometry.pbf')
 *
 * var collection = sharedstreetsPbf.geometry(buffer)
 * collection.features[0].id // => 'NxPFkg4CrzHeFhwV7Uiq7K'
 */
export function geometry (buffer) {
  var pbf = new Pbf(buffer)
  // Store Collection of results
  var results = []
  // Single Result
  var result = {
    id: null,
    fromIntersectionId: null,
    toIntersectionId: null,
    forwardReferenceId: null,
    backReferenceId: null,
    roadClass: null,
    latlons: []
  }
  // Read PBF Fields
  pbf.readFields(function (tag, data, pbf) {
    switch (tag) {
      case 1:
        data.id = pbf.readString()
        break
      case 2:
        data.fromIntersectionId = pbf.readString()
        break
      case 3:
        data.toIntersectionId = pbf.readString()
        break
      case 4:
        data.forwardReferenceId = pbf.readString()
        break
      case 5:
        data.backReferenceId = pbf.readString()
        break
      case 6:
        data.roadClass = getRoadClass(pbf.readVarint())
        break
      case 7:
        data.latlons = pbf.readPackedFloat()
        break
      default:
        if (data.id) {
          // Save result as GeoJSON LineString
          var id = data.id
          var coords = latlonsToCoords(data.latlons)
          var properties = {
            id: data.id,
            fromIntersectionId: data.fromIntersectionId,
            toIntersectionId: data.toIntersectionId,
            forwardReferenceId: data.forwardReferenceId,
            backReferenceId: data.backReferenceId,
            roadClass: data.roadClass
          }
          results.push(lineString(coords, properties, {id: id}))
        }
        // Reset Result/Data
        data.id = null
        data.fromIntersectionId = null
        data.toIntersectionId = null
        data.forwardReferenceId = null
        data.backReferenceId = null
        data.roadClass = null
        data.latlons = []
    }
  }, result)

  return featureCollection(results)
}

/**
 * Intersection Pbf
 *
 * Parser for SharedStreets Intersection Pbf Buffers
 *
 * @param {Buffer} buffer Pbf Buffer
 * @returns {FeatureCollection<Point>} FeatureCollection of SharedStreets Intersections
 * @example
 * var buffer = fs.readFileSync('z-x-y.intersection.pbf')
 *
 * var collection = sharedstreetsPbf.intersection(buffer)
 * collection.features[0].id // => 'NxPFkg4CrzHeFhwV7Uiq7K'
 */
export function intersection (buffer) {
  var results = []

  new Pbf(buffer).readFields(function (tag, data, pbf) {
    switch (tag) {
      case 1:
        data.id = pbf.readString()
        break
      case 2:
        data.osmNodeId = pbf.readVarint64()
        break
      case 3:
        data.lat = pbf.readFloat()
        break
      case 4:
        data.lon = pbf.readFloat()
        break
      case 5:
        data.inboundReferenceIds.push(pbf.readString())
        break
      case 6:
        data.outboundReferenceIds.push(pbf.readString())
        break
      default:
        if (data.id) {
          // Save SharedStreets Intersection GeoJSON Point
          var id = data.id
          var coord = [data.lon, data.lat]
          var properties = {
            id: data.id,
            osmNodeId: data.osmNodeId,
            inboundReferenceIds: data.inboundReferenceIds,
            outboundReferenceIds: data.outboundReferenceIds
          }
          results.push(point(coord, properties, {id: id}))
        }
        // Reset Data
        data.id = null
        data.osmNodeId = null
        data.lat = null
        data.lon = null
        data.inboundReferenceIds = []
        data.outboundReferenceIds = []
        return data
    }
  }, {
    id: null,
    osmNodeId: null,
    lat: null,
    lon: null,
    inboundReferenceIds: [],
    outboundReferenceIds: []
  })

  return featureCollection(results)
}

export function latlonsToCoords (latlons) {
  var coords = []
  latlons.reduce(function (lat, deg, index) {
    if (index % 2 === 0) return deg // Latitude
    coords.push([deg, lat])
  })
  return coords
}

export function getRoadClass (value) {
  switch (value) {
    case 0: { return 'Motorway' }
    case 1: { return 'Trunk' }
    case 2: { return 'Primary' }
    case 3: { return 'Secondary' }
    case 4: { return 'Tertiary' }
    case 5: { return 'Residential' }
    case 6: { return 'Unclassified' }
    case 7: { return 'Service' }
    case 8: { return 'Other' }
    default: throw new Error('[' + value + '] unknown RoadClass value')
  }
}

export function getFormOfWay (value) {
  switch (value) {
    case 0: { return 'Undefined' }
    case 1: { return 'Motorway' }
    case 2: { return 'MultipleCarriageway' }
    case 3: { return 'SingleCarriageway' }
    case 4: { return 'Roundabout' }
    case 5: { return 'TrafficSquare' }
    case 6: { return 'SlipRoad' }
    case 7: { return 'Other' }
    default: throw new Error('[' + value + '] unknown FormOfWay value')
  }
}
