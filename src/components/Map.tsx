import React from "react";
import { VectorMap } from "react-jvectormap";

//on hover on state, it call getdata(with state code) and display it on screen
const Map = () => {
  const map = [
    { code: "IN-RJ", value: 2000 },
    { code: "IN-MP", value: 2000 },
    { code: "IN-DL", value: 10000 },
    { code: "IN-KL", value: 10000 },
    { code: "IN-AP", value: 100 },
    { code: "IN-BR", value: 2000 },
    { code: "IN-NL", value: 2000 },
    { code: "IN-WB", value: 2000 },
    { code: "IN-HR", value: 10000 },
    { code: "IN-HP", value: 10000 },
    { code: "IN-AS", value: 10000 },
    { code: "IN-UT", value: 10000 },
    { code: "IN-JH", value: 10000 },
    { code: "IN-JK", value: 10000 },
    { code: "IN-UP", value: 100 },
    { code: "IN-SK", value: 10000 },
    { code: "IN-MZ", value: 10000 },
    { code: "IN-CT", value: 10000 },
    { code: "IN-CH", value: 10000 },
    { code: "IN-GA", value: 10000 },
    { code: "IN-GJ", value: 100 },
    { code: "IN-OR", value: 10000 },
    { code: "IN-TN", value: 2000 },
    { code: "IN-TR", value: 10000 },
    { code: "IN-AR", value: 10000 },
    { code: "IN-KA", value: 100 },
    { code: "IN-PB", value: 10000 },
    { code: "IN-ML", value: 10000 },
    { code: "IN-MN", value: 10000 },
    { code: "IN-MH", value: 2000 },
  ];
  const getdata = (key) => {
    console.log("hsjhds", key);
    var countryData = [];
    map.forEach(function (obj) {
      console.log("obj", countryData[obj.code]);
      countryData[obj.code] = obj.value;
    });
    console.log("svdbas", countryData[key]);
    return countryData[key];
  };

  console.log("shhjs", getdata());

  const getalldata = () => {
    var countryData = [];
    map.forEach(function (obj) {
      countryData[obj.code] = obj.value;
    });
    return countryData;
  };
  const handleshow2 = (e, el, code) => {
    // getdata(code);
    el.html(el.html());
  };
  return (
    <div>
      <VectorMap
        map={"in_mill"}
        backgroundColor="transparent"
        focusOn={{
          x: 0.5,
          y: 0.5,
          scale: 0,
          animate: false,
        }}
        zoomOnScroll={true}
        containerStyle={{
          width: "100%",
          height: "500px",
        }}
        // onRegionClick={console.log(countryCode);} //gets the country                         code
        onRegionTipShow={handleshow2}
        containerClassName="map"
        regionStyle={{
          initial: {
            fill: "#e4e4e4",
            "fill-opacity": 0.9,
            stroke: "none",
            "stroke-width": 0,
            "stroke-opacity": 0,
          },
          hover: {
            "fill-opacity": 0.8,
            cursor: "pointer",
          },
          selected: {
            fill: "#2938bc", // onclick colour of state
          },
        }}
        regionsSelectable={false}
        series={{
          regions: [
            {
              values: getalldata(), //can be directly served //with api response or any data
              scale: ["#00008b", "#008000", "#ffa500"], //color range
              normalizeFunction: "polynomial",
            },
          ],
        }}
      />
    </div>
  );
};
export default Map;
