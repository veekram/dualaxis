import React from "react";
import FusionCharts from "fusioncharts";
import TimeSeries from "fusioncharts/fusioncharts.timeseries";
import ReactFC from "react-fusioncharts";

ReactFC.fcRoot(FusionCharts, TimeSeries);

const jsonify = res => res.json();
const dataFetch = fetch(
  "https://s3.eu-central-1.amazonaws.com/fusion.store/ft/data/dual-y-axis-data.json"
).then(jsonify);
const schemaFetch = fetch(
  "https://s3.eu-central-1.amazonaws.com/fusion.store/ft/schema/dual-y-axis-schema.json"
).then(jsonify);

const dataSource = {
  chart: {
    multicanvas: false
  },
  caption: {
    text: "Energy & Temperature Measurements"
  },
  yaxis: [
    {
      plot: [
        {
          value: "Energy",
          connectnulldata: true,
          type: "line"
        }
      ],
      format: {
        suffix: " kWh"
      }
    },
    {
      plot: [
        {
          value: "Temperature",
          connectnulldata: true,
          type: "line"
        }
      ],
      format: {
        suffix: " °C"
      }
    }
  ]
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onFetchData = this.onFetchData.bind(this);
    this.state = {
      timeseriesDs: {
        type: "timeseries",
        renderAt: "container",
        width: "600",
        height: "400",
        dataSource
      }
    };
  }

  componentDidMount() {
    this.onFetchData();
  }

  onFetchData() {
    Promise.all([dataFetch, schemaFetch]).then(res => {
      const data = res[0];
      const schema = res[1];
      const fusionTable = new FusionCharts.DataStore().createDataTable(
        data,
        schema
      );
      const timeseriesDs = Object.assign({}, this.state.timeseriesDs);
      timeseriesDs.dataSource.data = fusionTable;
      this.setState({
        timeseriesDs
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.timeseriesDs.dataSource.data ? (
           <ReactFC {...this.state.timeseriesDs} />
        ) : (
           "loading"
        )}
      </div>
    );
  }
}

export default App;
