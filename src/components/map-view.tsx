"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Activity, AgeGroup } from "@/lib/types";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  activities: Activity[];
  ageGroup: AgeGroup;
}

export default function MapView({ activities, ageGroup }: MapViewProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  return (
    <MapContainer
      center={[46.8182, 8.2275]}
      zoom={8}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {activities.map((activity) => (
        <Marker
          key={activity.id}
          position={[activity.location.coordinates.lat, activity.location.coordinates.lng]}
        >
          <Popup>
            <div className="min-w-[200px]">
              <p className="font-semibold text-sm mb-1">{activity.name}</p>
              <p className="text-xs text-gray-500 mb-2">{activity.location.city}</p>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {activity.pricing[ageGroup] === 0 ? "Free" : `CHF ${activity.pricing[ageGroup]}`}
                </span>
                <Link
                  href={`/activities/${activity.slug}`}
                  className="text-xs text-red-600 font-medium hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
