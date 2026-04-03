"use client";

import { useState } from "react";
import { Train } from "lucide-react";
import { estimateSBBFare, DEPARTURE_CITIES } from "@/lib/sbb";

interface SBBEstimatorProps {
  destinationCity: string;
  activityPrice: number;
}

export function SBBEstimator({ destinationCity, activityPrice }: SBBEstimatorProps) {
  const [fromCity, setFromCity] = useState("");
  const estimate = fromCity ? estimateSBBFare(fromCity, destinationCity) : null;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Train className="h-5 w-5 text-red-600" />
        <h3 className="font-semibold text-sm">SBB Travel Cost Estimator</h3>
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Departing from</label>
        <select
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Select your city...</option>
          {DEPARTURE_CITIES.filter((c) => c !== destinationCity).map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {estimate && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Train (2nd class)</span>
            <span className="font-medium">CHF {estimate.adultPrice}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">With Half-Fare Card</span>
            <span className="font-medium text-green-600">CHF {estimate.halfFarePrice}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Travel time</span>
            <span className="font-medium">{estimate.travelTime}</span>
          </div>
          <div className="flex justify-between py-2 bg-gray-50 -mx-4 px-4 rounded-b-lg mt-2">
            <span className="font-semibold text-gray-900">Total Day Trip Cost</span>
            <div className="text-right">
              <p className="font-bold text-gray-900">
                CHF {(estimate.adultPrice * 2 + activityPrice).toFixed(0)}
              </p>
              <p className="text-xs text-green-600">
                CHF {(estimate.halfFarePrice * 2 + activityPrice).toFixed(0)} with Half-Fare
              </p>
            </div>
          </div>
        </div>
      )}

      {!fromCity && (
        <p className="text-xs text-gray-400 text-center py-2">
          Select your departure city to see estimated travel costs
        </p>
      )}
    </div>
  );
}
