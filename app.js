var app = angular.module('app', ['ngVis']);

// app.service('myService', function ($http) {
//     return {
//         serverCall: function () {
//             return $http.get('data.json').then(function (response) {
//                 return response.data;
//             });
//         }
//     };
// });

app.controller('myCtrl', ['$scope', 'VisDataSet', '$http',
    function($scope, VisDataSet, $http) {

        function init() {
            updateValues();
        }
        init();

        function updateValues () {
            $http.get('data.json').then(function (response) {
                $scope.org_nodes = response.data;
                $scope.data.nodes.add(response.data);
                $scope.data.edges.add([]);
                $scope.$apply();
            });
        }

        $scope.color = 'blue';

        $scope.org_nodes = [];
        $scope.edges = [];
        $scope.data = {
            "nodes": new vis.DataSet($scope.org_nodes),
            "edges": new vis.DataSet($scope.edges)
        };
        $scope.selectNodeValue = '';
        $scope.selectNodeValueStatus = false;
        $scope.events = {};
        $scope.viewRadioOption = false;

        $scope.options = {
            autoResize: true,
            height: '450',
            width: '100%',
            nodes: {
                font: {
                    size: 24,
                    color: "#efab00"
                },
                borderWidth: 2,
                borderWidthSelected: 2,
                shape: "circle",
                color: {
                    border: '#d0006f',
                    background: '#E84B9F',
                    highlight: {
                        border: '#d0006f',
                        background: '#d0006f'
                    },
                    hover: {
                        border: '#58b368',
                        background: '#94CF9F'
                    }
                },
            },
            interaction: {
                navigationButtons: true,
                keyboard: true
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
                maxVelocity: 146,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: {
                    enabled: true,
                    iterations: 2000,
                    updateInterval: 50
                }
            },
            layout: {
                randomSeed: 34
            }
        };

        $scope.list = ["United Kingdom", "Canada", "Brazil", "Australia", "United States", "India"];

        $scope.selectedCountry = '';

        $scope.filterValue = function (value) {
            $scope.onChangeSelectedvalue(value);
        }

        $scope.onChangeSelectedvalue = function (selected_value) {
            updateValues ();
            var filter_country = _.filter($scope.org_nodes, ['country', $scope.selectedCountry]);
            if(selected_value === "blue" || $scope.color === 'blue') {
                displayValueChart(filter_country);
            }
            else if (selected_value === "green") {
                var filter_therapeutic_area = _.uniqBy(filter_country, function (e) {
                    return e.therapeutic_area;
                });
                displayTherapeuticArea(filter_therapeutic_area);
            }
        }

        function updateEdges(filtered_data) {
            for(var i = 0; i < filtered_data.length; i++) {
                if(i != 0) {
                    var new_data_edges = {
                        "from": filtered_data[0].id,
                        "to": filtered_data[i].id
                    }
                    $scope.edges.push(new_data_edges);
                }
            }
        }

        function displayTherapeuticArea(filter_therapeutic_data) {
            if(filter_therapeutic_data.length != 0) {
                $scope.edges = [];
                $scope.org_nodes = [];
                $scope.org_nodes.push({
                    "id": "E-"+filter_therapeutic_data[0].id,
                    "label": filter_therapeutic_data[0].country
                })
                for(var j = 0; j < filter_therapeutic_data.length; j++) {
                    var new_data_nodes = '';
                    new_data_nodes = {
                        "id": filter_therapeutic_data[j].id,
                        "label": filter_therapeutic_data[j].therapeutic_area
                    }
                    $scope.org_nodes.push(new_data_nodes)
                }
                updateEdges($scope.org_nodes);
                $scope.viewRadioOption = true;
                $scope.data.nodes.clear();
                $scope.data.edges.clear();
                $scope.data.nodes.add($scope.org_nodes);
                $scope.data.edges.add($scope.edges);
                $scope.$apply();
            } else if(filter_therapeutic_data.length === 0) {
                $scope.viewRadioOption = false;
                $scope.data.nodes.clear();
                $scope.data.edges.clear();
                updateValues();
            }
        }

        function displayValueChart(filtered_data) {
            if(filtered_data.length != 0) {
                $scope.edges = [];
                $scope.org_nodes = [];
                updateEdges(filtered_data);
                for(var j = 0; j < filtered_data.length; j++) {
                    var new_data_nodes = '';
                    if(j === 0) {
                        new_data_nodes = {
                            "id": filtered_data[j].id,
                            "label": filtered_data[j].country,
                            "country": filtered_data[j].country,
                            "therapeutic_area": filtered_data[j].therapeutic_area
                        }
                    }
                    else {
                        new_data_nodes = {
                            "id": filtered_data[j].id,
                            "label": filtered_data[j].label,
                            "country": filtered_data[j].country,
                            "therapeutic_area": filtered_data[j].therapeutic_area
                        }
                    }
                    $scope.org_nodes.push(new_data_nodes)
                }
                $scope.viewRadioOption = true;
                $scope.data.nodes.clear();
                $scope.data.edges.clear();
                $scope.data.nodes.add($scope.org_nodes);
                $scope.data.edges.add($scope.edges);
                $scope.$apply();
            }
            else if(filtered_data.length === 0) {
                $scope.viewRadioOption = false;
                $scope.data.nodes.clear();
                $scope.data.edges.clear();
                updateValues();
            }
        }
        
        $scope.events.selectNode = function () {
            $scope.displayNodeInfo(arguments[0].nodes[0]);
            $scope.$apply();
        };

        $scope.displayNodeInfo = function (id) {
            var filtered_array = _.filter($scope.org_nodes, ['id', id]);
            $scope.selectNodeValueStatus = true;
            $scope.selectNodeValue = filtered_array[0];
        }

        $scope.onClickReset = function () {
            $scope.selectedCountry = '';
            $scope.selectNodeValueStatus = false;
            $scope.viewRadioOption = false;
            $scope.data.nodes.clear();
            $scope.data.edges.clear();
            updateValues();
        }
    }
]);