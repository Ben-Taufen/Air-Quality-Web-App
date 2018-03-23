var airQualityApp = angular.module('airQualityApp',[]);

airQualityApp.controller('tableController',function($scope, $http){
	//
	$http.get("https://api.openaq.org/v1/measurements").then(
		function(response)
		{
			$scope.tableData = response.data.results;

		}
	);

});
