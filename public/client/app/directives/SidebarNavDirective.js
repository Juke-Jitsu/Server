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


module.exports = SidebarNavDirective;

function SidebarNavDirective() {

    return {
        "restrict": "E",
        "templateUrl": "partial/sidebar-nav-directive.html",
        clickOutsideToClose: true,
        "controller": /* @ngInject */ function ($scope, $timeout, $mdSidenav, $log, sessionManager, queueManager, $mdDialog) {
            $scope.close = function () {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav('left').close()
                        .then(function () {
                            $log.debug("close LEFT is done");
                        });
            };
            
            $scope.toggleSidenav = function(menuId) {
                $mdSidenav(menuId).toggle();
            };

            $scope.search = function () {
                sessionManager.switchToSearch();
                $mdSidenav('left').close();
            };

            $scope.queue = function () {
                sessionManager.switchToQueue();
                $mdSidenav('left').close();
            };

            $scope.nowPlaying = function () {
                queueManager.viewNowPlaying();
                $mdSidenav('left').close();
            };

            $scope.launchAbout = function () {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: "partial/dialog/about-juke-jitsu-directive.html",
                    controller: /*ngInject*/ function ($scope, $mdDialog) {

                        $scope.closeDialog = function () {
                            // Easily hides most recent dialog shown...
                            // no specific instance reference is needed.
                            $mdDialog.hide();
                        };

                    }
                });
            };
        }
    };

}