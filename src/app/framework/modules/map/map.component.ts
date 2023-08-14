import {AfterViewInit, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {MapService} from './map.service';
import LatLng = google.maps.LatLng;
import {Subscription} from 'rxjs';

export interface FwCustomMarker {
    ID?: string;
    position: LatLng;
    icon?: any;
    infoWindow?: any;
    draggable?: boolean;
}

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {

    // ID of the component, used to target a specific component when multiple maps are used
    @Input() ID: string = null;

    @Input() width = '100%';
    @Input() height = '500px';

    // Initial list of markers to add
    @Input() markers: FwCustomMarker[];

    @Input() zoom = 12;
    @Input() maxZoom = 15;
    @Input() draggable = true;
    @Input() streetViewControl = false;

    // Position where to center the map, only used when there are no initial markers set
    @Input() center: google.maps.LatLng = null;

    @Output() buttonClickedEvent = new EventEmitter();
    @Output() markerPositionChangedEvent = new EventEmitter();

    map;
    bounds: google.maps.LatLngBounds;
    addMarker$: Subscription;
    infoWindow: google.maps.InfoWindow;

    private addedMarkers: google.maps.Marker[] = [];

    constructor(
        private mapService: MapService,
        private zone: NgZone,
    ) {
    }

    ngOnInit(): void {
        this.map = google.maps.Map;
        this.bounds = new google.maps.LatLngBounds();
        this.infoWindow = new google.maps.InfoWindow({content: 'empty'});

        this.addMarker$ = this.mapService.addMarker.subscribe(data => {
            if (!data.ID || data.ID === this.ID) {
                this.addMarker(data);
            }
        });
    }

    ngOnDestroy(): void {
        this.addMarker$.unsubscribe();
    }

    ngAfterViewInit(): void {
        if (!this.center && !this.markers) {
            navigator.geolocation.getCurrentPosition(position => {
                this.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                this.setupMap();
            });
        } else {
            this.setupMap();
        }
    }

    setupMap(): void {
        this.map = new google.maps.Map(document.getElementById(this.ID), {
            center: this.center,
            zoom: this.zoom,
            streetViewControl: this.streetViewControl,
            draggable: this.draggable,
            maxZoom: this.maxZoom
        });
        if (this.markers) {
            this.markers.forEach(marker => this.addMarker(marker));
        }
    }

    setDraggable(draggable: boolean): void {
        this.addedMarkers.forEach(marker => {
            marker.setDraggable(draggable);

            if (draggable) {
                google.maps.event.addListener(marker, 'dragend', (e) => {
                    this.markerPositionChangedEvent.emit(marker);
                });
            } else {
                google.maps.event.clearListeners(marker, 'dragend');
            }
        });
    }

    addMarker(markerData: FwCustomMarker): void {
        const marker = new google.maps.Marker({
            map: this.map,
            position: markerData.position,
        });

        if (markerData.draggable === true) {
            marker.setDraggable(markerData.draggable);

            google.maps.event.addListener(marker, 'dragend', (e) => {
                this.markerPositionChangedEvent.emit(marker);
            });
        }

        if (markerData.icon) {
            marker.setIcon(markerData.icon);
        }

        if (markerData.infoWindow) {
            marker.addListener('click', () => {
                this.infoWindow.setContent(markerData.infoWindow);
                this.infoWindow.open(this.map, marker);

                google.maps.event.addListenerOnce(this.infoWindow, 'domready', () => {
                    const buttons = document.getElementsByClassName(`btn`);
                    for (let i = 0; i < buttons.length; i++) {
                        const that = this;
                        buttons[i].addEventListener('click', function () {
                            that.zone.run(() => that.buttonClick(this.dataset.type, this.dataset.id));
                        });
                    }
                });
            });
        }

        this.bounds.extend(marker.getPosition());
        this.map.fitBounds(this.bounds);

        this.addedMarkers.push(marker);
    }

    removeMarkers(): void {
        this.addedMarkers.forEach(marker => marker.setMap(null));
        this.bounds = new google.maps.LatLngBounds();
    }

    buttonClick(type, ID): void {
        this.buttonClickedEvent.emit({type, ID});
    }

}
