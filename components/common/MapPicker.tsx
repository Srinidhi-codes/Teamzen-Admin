"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <Marker
            position={[lat || 0, lng || 0]}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onChange(position.lat, position.lng);
                },
            }}
        />
    );
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
    const defaultCenter: [number, number] = [lat || 20.5937, lng || 78.9629]; // India center as default
    const [isLocating, setIsLocating] = useState(false);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChange(position.coords.latitude, position.coords.longitude);
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                setIsLocating(false);
            }
        );
    };

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border shadow-inner mt-4 z-0 relative group">
            <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute top-4 right-4 z-1000 bg-background/90 backdrop-blur-md p-2.5 rounded-xl border border-border shadow-2xl hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 flex items-center gap-2 group/locate"
            >
                {isLocating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <LocateFixed className="w-4 h-4 group-hover/locate:rotate-12 transition-transform" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest pr-1">Locate Me</span>
            </button>

            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={lat} lng={lng} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
