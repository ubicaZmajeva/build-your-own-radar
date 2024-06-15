/* eslint no-constant-condition: "off" */

const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  capitalize: require('lodash/capitalize'),
  each: require('lodash/each'),
}

const InputSanitizer = require('./inputSanitizer')
const Radar = require('../models/radar')
const Quadrant = require('../models/quadrant')
const Ring = require('../models/ring')
const Blip = require('../models/blip')
const GraphingRadar = require('../graphing/radar')

const plotRadar = function (title, blips, alternativeRadars) {
  if (title.endsWith('.csv')) {
    title = title.substring(0, title.length - 4)
  }
  if (title.endsWith('.json')) {
    title = title.substring(0, title.length - 5)
  }
  document.title = title
  d3.selectAll('.loading').remove()

  var rings = _.map(_.uniqBy(blips, 'ring'), 'ring')
  var ringMap = {}

  _.each(rings, function (ringName, i) {
    ringMap[ringName] = new Ring(ringName, i)
  })

  var quadrants = {}
  _.each(blips, function (blip) {
    if (!quadrants[blip.quadrant]) {
      quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant))
    }
    quadrants[blip.quadrant].add(
      new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description),
    )
  })

  var radar = new Radar()
  _.each(quadrants, function (quadrant) {
    radar.addQuadrant(quadrant)
  })

  if (alternativeRadars !== undefined || true) {
    alternativeRadars.forEach(function (sheetName) {
      radar.addAlternative(sheetName)
    })
  }

  if (title !== undefined || true) {
    radar.setCurrentSheet(title)
  }

  var size = window.innerHeight - 133 < 620 ? 620 : window.innerHeight - 133

  new GraphingRadar(size, radar).init().plot()
}

const Document = function (filename) {
  var self = {}

  self.build = function () {
    debugger
    let rawdata = fs.readFileSync(filename)
    createBlips(rawdata)
  }

  var createBlips = function (data, title) {
    try {
      var blips = _.map(data, new InputSanitizer().sanitize)
      plotRadar(title || 'Techology lighthouse', blips, [])
    } catch (exception) {
      HandleException(exception)
    }
  }

  self.init = function () {
    plotLoading()
    return self
  }

  return self
}

const TechnologyLighthouse = function () {
  var self = {}
  var sheet

  self.build = function () {
    document.title = 'OTP Banka Srbija - TECHNOLOGY lighthouse | visualized by Innovation Department'
    try {
      sheet = Document('./technology-lighthouse-snapshots/technology-2022.json')
      sheet.init().build()
    } catch (exception) {
      HandleException(exception)
    }
  }

  return self
}

const HandleException = function (exception) {
  debugger
  window.location.href = 'error.html'
}

function plotLoading() {
  document.querySelector('main .title').innerHTML = 'Turning on the technology lighthouse...'
}

module.exports = TechnologyLighthouse
