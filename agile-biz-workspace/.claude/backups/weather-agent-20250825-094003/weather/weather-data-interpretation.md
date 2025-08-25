# Weather Data Interpretation - Reading Maps, Radar, and Models
<!-- Token Count: ~2,900 tokens -->

## Surface Weather Maps

### Station Model Interpretation
- **Temperature**: Upper left (°F or °C)
- **Dew Point**: Lower left
- **Pressure**: Upper right (last 3 digits, add 10 or 9)
- **Wind Barbs**: Direction from, speed by flags/barbs
  - Short barb: 5 knots
  - Long barb: 10 knots
  - Pennant: 50 knots
- **Weather Symbols**: Present weather conditions
- **Cloud Cover**: Circle fill (clear to overcast)
- **Pressure Tendency**: 3-hour change and pattern

### Isobaric Analysis
- **Isobars**: Lines of equal pressure (4mb intervals typical)
- **High Pressure**: Clockwise flow (NH), clear center H
- **Low Pressure**: Counterclockwise flow (NH), center L
- **Pressure Gradient**: Tight spacing = strong winds
- **Ridges**: Elongated highs, fair weather
- **Troughs**: Elongated lows, unsettled weather

### Frontal Analysis
- **Cold Front**: Blue triangles pointing direction
- **Warm Front**: Red semicircles pointing direction
- **Occluded Front**: Purple triangles and semicircles
- **Stationary Front**: Alternating red/blue symbols
- **Dry Line**: Brown dashed line (moisture boundary)
- **Frontal Zones**: Temperature gradient, wind shift

## Upper Air Charts

### Constant Pressure Charts
- **850mb (~5,000ft)**: Low-level flow, moisture transport
- **700mb (~10,000ft)**: Mid-level dynamics, precipitation
- **500mb (~18,000ft)**: Steering flow, vorticity
- **300mb (~30,000ft)**: Jet stream level
- **200mb (~40,000ft)**: Upper jet analysis

### Height Contours
- **Geopotential Height**: Meters above sea level
- **Contour Intervals**: 30m (850mb), 60m (500mb)
- **Ridges**: Higher heights, warming, subsidence
- **Troughs**: Lower heights, cooling, rising motion
- **Closed Lows**: Cut-off systems, slow movement

### Wind Analysis
- **Isotachs**: Lines of equal wind speed
- **Jet Streaks**: Maximum wind cores
- **Entrance/Exit Regions**: Vertical motion patterns
- **Diffluence/Confluence**: Divergence/convergence aloft
- **Speed Convergence**: Deceleration zones

## Weather Radar Interpretation

### Reflectivity Products
- **dBZ Scale**: 
  - <20 dBZ: Light precipitation/drizzle
  - 20-40 dBZ: Moderate rain
  - 40-50 dBZ: Heavy rain
  - 50-60 dBZ: Very heavy rain/small hail
  - >60 dBZ: Large hail likely
- **Composite Reflectivity**: Maximum in vertical column
- **Base Reflectivity**: Single elevation scan
- **Echo Tops**: Height of precipitation

### Velocity Products
- **Doppler Velocity**: Toward (green) / Away (red) from radar
- **Storm-Relative Velocity**: Motion relative to storm
- **Mesocyclone Detection**: Rotation couplet
- **Divergence Signature**: Downburst indication
- **VAD Wind Profile**: Winds aloft from velocity

### Dual-Polarization Products
- **Correlation Coefficient**: Uniformity of targets
- **Differential Reflectivity**: Particle shape/size
- **Specific Differential Phase**: Rainfall rate
- **Hydrometeor Classification**: Rain, snow, hail, etc.
- **Melting Layer**: Bright band identification

### Radar Artifacts and Limitations
- **Ground Clutter**: Non-meteorological echoes
- **Anomalous Propagation**: Beam bending
- **Beam Blockage**: Terrain interference
- **Range Folding**: Velocity aliasing
- **Attenuation**: Signal weakening in heavy precipitation
- **Cone of Silence**: No data directly above radar

## Satellite Imagery

### Visible Imagery
- **Wavelength**: 0.6 micrometers
- **Applications**: Cloud texture, thickness, shadows
- **Limitations**: Daylight only
- **Interpretation**: Brighter = thicker clouds/higher albedo
- **Features**: Fog/stratus, cumulus fields, snow cover

### Infrared Imagery
- **Wavelength**: 10-12 micrometers
- **Applications**: 24-hour availability, cloud tops
- **Temperature Scale**: Colder = higher/whiter
- **Enhanced IR**: Color tables for convection
- **Features**: Overshooting tops, warm sectors

### Water Vapor Imagery
- **Wavelength**: 6.2-7.3 micrometers
- **Applications**: Upper-level moisture, jet streams
- **Interpretation**: Dry slots, atmospheric rivers
- **Levels**: Upper (6.2μm), mid (6.9μm), lower (7.3μm)
- **Dynamics**: Vorticity advection, jet streaks

### Multi-Spectral Applications
- **RGB Composites**: Combine channels for features
- **Day/Night Band**: Low-light visible
- **Fog/Stratus Detection**: IR difference techniques
- **Fire Detection**: Hot spot identification
- **Volcanic Ash**: SO2 and ash discrimination

## Numerical Weather Models

### Global Models
- **GFS (Global Forecast System)**: 
  - Resolution: 13km
  - Updates: 4x daily
  - Range: 16 days
  - Strengths: Long range, global coverage
- **ECMWF (European)**: 
  - Resolution: 9km
  - Updates: 2x daily
  - Range: 10 days
  - Strengths: Accuracy, ensemble system
- **CMC (Canadian)**: 
  - Resolution: 25km
  - Updates: 2x daily
  - Range: 10 days
  - Strengths: Arctic, different physics

### Mesoscale Models
- **NAM (North American Mesoscale)**:
  - Resolution: 12km (3km nest)
  - Updates: 4x daily
  - Range: 84 hours
  - Strengths: Mesoscale detail
- **RAP (Rapid Refresh)**:
  - Resolution: 13km
  - Updates: Hourly
  - Range: 21 hours
  - Strengths: Aviation, nowcasting
- **HRRR (High-Resolution Rapid Refresh)**:
  - Resolution: 3km
  - Updates: Hourly
  - Range: 18 hours
  - Strengths: Convection, local effects

### Ensemble Systems
- **GEFS**: 31 members, probability forecasts
- **SREF**: Short-range ensemble, mesoscale
- **ECMWF EPS**: 51 members, calibrated
- **Spaghetti Plots**: 500mb height contours
- **Probability Products**: Exceedance thresholds

## Model Output Statistics

### Common Parameters
- **MSLP**: Mean sea level pressure
- **500mb Heights**: Synoptic pattern
- **850mb Temperature**: Warm/cold advection
- **Thickness**: 1000-500mb, rain/snow line
- **Precipitable Water**: Total column moisture
- **CAPE/CIN**: Instability parameters
- **Wind Shear**: Speed and directional

### Precipitation Types
- **Model QPF**: Quantitative precipitation forecast
- **Precipitation Type**: Algorithm-based
- **Snow Ratios**: Temperature dependent
- **Freezing Level**: Rain/snow transition
- **Critical Thickness**: 540dm rain/snow line

### Derived Products
- **Vorticity**: Rotation and divergence
- **Q-Vectors**: Forcing for vertical motion
- **Frontogenesis**: Frontal development
- **Isentropic Analysis**: Upglide patterns
- **Omega**: Vertical velocity

## Thermodynamic Diagrams

### Skew-T Log-P Interpretation
- **Temperature Profile**: Red line, stability assessment
- **Dew Point Profile**: Green line, moisture
- **Wind Barbs**: Height variation of wind
- **Parcel Path**: Lifted parcel temperature
- **CAPE Area**: Positive buoyancy
- **CIN Area**: Negative buoyancy

### Stability Indices
- **Lifted Index**: Surface parcel to 500mb
- **K-Index**: Thunderstorm potential
- **Total Totals**: Severe weather threat
- **Showalter Index**: 850mb parcel stability
- **SWEAT Index**: Severe weather threat

### Key Levels
- **LCL**: Lifted Condensation Level (cloud base)
- **LFC**: Level of Free Convection
- **EL**: Equilibrium Level (cloud top)
- **CCL**: Convective Condensation Level
- **Freezing Level**: 0°C height

## Meteogram Interpretation

### Time Series Elements
- **Temperature/Dew Point**: Diurnal variation
- **Wind Speed/Direction**: Temporal changes
- **Pressure**: Trends and changes
- **Precipitation**: Timing and amounts
- **Cloud Cover**: Sky condition evolution

### Pattern Recognition
- **Frontal Passages**: Sharp changes
- **Diurnal Cycles**: Daily patterns
- **Advection Patterns**: Temperature trends
- **Pressure Falls**: Approaching systems
- **Wind Shifts**: Fronts, sea breezes

## Nowcasting Techniques

### Extrapolation Methods
- **Storm Motion Vectors**: Radar tracking
- **Persistence**: Current trends continue
- **Advection**: Pattern movement
- **Growth/Decay**: Intensity trends
- **Mergers**: Cell interactions

### Pattern Recognition
- **Satellite Loops**: Cloud development
- **Radar Trends**: Echo training, backbuilding
- **Surface Convergence**: Boundary interactions
- **Mesoscale Features**: Outflow boundaries
- **Composite Analysis**: Multiple data sources

## Quality Control

### Data Validation
- **Range Checks**: Reasonable values
- **Temporal Consistency**: Smooth changes
- **Spatial Consistency**: Neighboring stations
- **Cross-Validation**: Multiple sources
- **Bias Correction**: Systematic errors

### Common Errors
- **Model Initialization**: Bad input data
- **Interpolation Errors**: Sparse data regions
- **Instrument Errors**: Calibration issues
- **Communication Errors**: Data transmission
- **Time Stamp Issues**: UTC conversions

## Forecast Verification

### Accuracy Metrics
- **POD**: Probability of Detection
- **FAR**: False Alarm Ratio
- **CSI**: Critical Success Index
- **Bias**: Over/under forecasting
- **RMSE**: Root Mean Square Error

### Skill Scores
- **Brier Score**: Probability forecasts
- **ROC**: Relative Operating Characteristic
- **Reliability Diagrams**: Calibration assessment
- **Rank Histograms**: Ensemble spread
- **Continuous Ranked Probability Score**: Ensemble skill

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)