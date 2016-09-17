/* 
 * The MIT License
 *
 * Copyright 2016 Eli Davis.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


module.exports = SearchButtonDirective;

/**
 * 
 * @param {type} $document
 * @returns {nm$_SearchButtonDirective.QueueDirective.SearchButtonDirectiveAnonym$0}
 * @ngInject
 */
function SearchButtonDirective() {

    return {
        'restrict': 'E',
        'template': '<md-button ng-click="toggleLeft()"><md-icon md-svg-src="svg/ic_view_list_white_24px.svg" aria-label="Menu "></md-icon>  Menu</md-button>',
        'controller': /*@ngInject*/function ($scope, $mdSidenav) {
            
            $scope.toggleLeft = function(){
                $mdSidenav("left").toggle();
            };
            
        }
    };
}
