angular.module('openattic.datatable')
  .directive("sortfield", function () {
    return {
      link: function (scope, element, attr) {
        if (typeof attr.sortdefault !== "undefined")
          scope.sortByField(attr.sortfield || element.text().toLowerCase(), (attr.sortorder || "ASC" ).toUpperCase());
      }
    };
  });