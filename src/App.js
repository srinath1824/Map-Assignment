import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import { connect } from "react-redux";
import "./App.css";
import actionTypes from "./components/actions";

function App(props) {
  const [activePark, setActivePark] = useState(null);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const { setLoading, setMapData, setFilteredApiData } = props;
    setLoading(true);
    axios
      .get("https://data.nasa.gov/resource/y77d-th95.json")
      .then((res) => {
        setMapData(res.data);
        setFilteredApiData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("ERROR WHILE FETCHING DATA");
      });
  }, []);

  useEffect(() => {
    const { apiData } = props;
    apiData &&
      apiData.map((data) => {
        setYears((years) => [...years, new Date(data.year).getFullYear()]);
      });
  }, [props.apiData]);

  useEffect(() => {
    let sortYears = years.sort((a, b) => a - b);
    let obj = {};
    let rangeYears = [];
    sortYears.map((year, index) => {
      if (index % 50 !== 0) {
        rangeYears.push(year);
      } else if (index !== 0 && index % 50 === 0) {
        rangeYears.push(year);
        obj[
          `${rangeYears[0]} to ${rangeYears[rangeYears.length - 1]}`
        ] = rangeYears.slice(0, index);
        rangeYears = [];
      }
    });
    props.setFilterDropDown(obj);
    setYears(sortYears);
  }, [years]);

  const handleChange = (e) => {
    if (e.target.value === "All") {
      props.setFilteredApiData(props.apiData);
    } else {
      let keys = Object.keys(props.filterDropDown);
      let index = keys.indexOf(e.target.value);
      let from = 50 * index;
      let to = index * 50 + 50;
      let filteredData = props.apiData.slice(from, to);
      props.setFilteredApiData(filteredData);
    }
  };

  return (
    <div className="App">
      <h1>Visualizing historical data on meteorite landings</h1>
      <Container fixed>
        <div style={{ padding: "20px" }}>
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-age-native-simple">
              Select Year Range
            </InputLabel>
            <Select
              native
              style={{ width: "150px" }}
              onChange={handleChange}
              label="Select Year Range"
              inputProps={{
                name: "age",
                id: "outlined-age-native-simple",
              }}
            >
              <option aria-label="None" value="All">
                All
              </option>
              {props.filterDropDown &&
                Object.keys(props.filterDropDown).map((value, index) => {
                  return (
                    <option key={index} value={value}>
                      {value}
                    </option>
                  );
                })}
            </Select>
          </FormControl>
        </div>
        {!props.loading ? (
          <div>
            <Map center={[0, 0]} zoom={1}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              {props.filteredApiData &&
                props.filteredApiData.map((park) => {
                  return (
                    <Marker
                      key={park.id}
                      position={[
                        park.geolocation && park.geolocation.coordinates[1]
                          ? park.geolocation.coordinates[1]
                          : "",
                        park.geolocation && park.geolocation.coordinates[0]
                          ? park.geolocation.coordinates[0]
                          : "",
                      ]}
                      onClick={() => {
                        setActivePark(park);
                      }}
                    />
                  );
                })}

              {activePark && (
                <Popup
                  position={[
                    activePark.geolocation.coordinates[1],
                    activePark.geolocation.coordinates[0],
                  ]}
                  onClose={() => {
                    setActivePark(null);
                  }}
                >
                  <div>
                    <h2>{activePark.name}</h2>
                    <p>Latitide: {activePark.geolocation.coordinates[0]}</p>
                    <p>Longitude: {activePark.geolocation.coordinates[1]}</p>
                    <p>Year: {new Date(activePark.year).getFullYear()}</p>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        ) : (
          <div>
            <CircularProgress color="primary" />
          </div>
        )}
      </Container>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    loading: state.dashboard.loading,
    apiData: state.dashboard.apiData,
    filterDropDown: state.dashboard.filterDropDown,
    filteredApiData: state.dashboard.filteredApiData,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setLoading: (data) => dispatch({ type: actionTypes.LOADING_PAGE, data }),
    setMapData: (data) => dispatch({ type: actionTypes.LOAD_API_DATA, data }),
    setFilteredApiData: (data) =>
      dispatch({ type: actionTypes.FILTERED_API_DATA, data }),
    setFilterDropDown: (data) =>
      dispatch({ type: actionTypes.FILTER_DROPDOWN, data }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
