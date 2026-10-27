import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../theme/colors.dart';

// Mock zone data — will come from API
class _Zone {
  final String name;
  final String controller;
  final int ap;
  final Color color;
  final List<LatLng> polygon;

  const _Zone({
    required this.name,
    required this.controller,
    required this.ap,
    required this.color,
    required this.polygon,
  });
}

// ─── BHOPAL ZONES ───
final _bhopalZones = [
  _Zone(
    name: 'MP Nagar',
    controller: 'Iron Warriors',
    ap: 3420,
    color: FitColors.primary,
    polygon: [
      LatLng(23.2350, 77.4180),
      LatLng(23.2350, 77.4340),
      LatLng(23.2250, 77.4340),
      LatLng(23.2250, 77.4180),
    ],
  ),
  _Zone(
    name: 'Arera Colony',
    controller: 'Fitness Freaks',
    ap: 2890,
    color: FitColors.challengeGroup,
    polygon: [
      LatLng(23.2160, 77.4300),
      LatLng(23.2160, 77.4460),
      LatLng(23.2060, 77.4460),
      LatLng(23.2060, 77.4300),
    ],
  ),
  _Zone(
    name: 'New Market',
    controller: 'Morning Runners',
    ap: 1890,
    color: FitColors.challengeVersus,
    polygon: [
      LatLng(23.2370, 77.4020),
      LatLng(23.2370, 77.4180),
      LatLng(23.2280, 77.4180),
      LatLng(23.2280, 77.4020),
    ],
  ),
  _Zone(
    name: 'TT Nagar',
    controller: 'Gym Rats',
    ap: 2100,
    color: FitColors.challengeStake,
    polygon: [
      LatLng(23.2280, 77.3900),
      LatLng(23.2280, 77.4020),
      LatLng(23.2190, 77.4020),
      LatLng(23.2190, 77.3900),
    ],
  ),
  _Zone(
    name: 'Habibganj',
    controller: 'CrossFit Crew',
    ap: 1560,
    color: FitColors.challengeZone,
    polygon: [
      LatLng(23.2300, 77.4380),
      LatLng(23.2300, 77.4520),
      LatLng(23.2210, 77.4520),
      LatLng(23.2210, 77.4380),
    ],
  ),
  _Zone(
    name: 'Kolar Road',
    controller: 'Unclaimed',
    ap: 320,
    color: FitColors.textMuted,
    polygon: [
      LatLng(23.2050, 77.4150),
      LatLng(23.2050, 77.4300),
      LatLng(23.1960, 77.4300),
      LatLng(23.1960, 77.4150),
    ],
  ),
  _Zone(
    name: 'Shahpura',
    controller: 'Yoga Squad',
    ap: 980,
    color: const Color(0xFF8B5CF6),
    polygon: [
      LatLng(23.2010, 77.4420),
      LatLng(23.2010, 77.4560),
      LatLng(23.1920, 77.4560),
      LatLng(23.1920, 77.4420),
    ],
  ),
  _Zone(
    name: 'Bairagarh',
    controller: 'Track Stars',
    ap: 740,
    color: const Color(0xFFEC4899),
    polygon: [
      LatLng(23.2620, 77.3780),
      LatLng(23.2620, 77.3950),
      LatLng(23.2520, 77.3950),
      LatLng(23.2520, 77.3780),
    ],
  ),
  _Zone(
    name: 'Misrod',
    controller: 'Unclaimed',
    ap: 150,
    color: FitColors.textMuted,
    polygon: [
      LatLng(23.1850, 77.4500),
      LatLng(23.1850, 77.4650),
      LatLng(23.1760, 77.4650),
      LatLng(23.1760, 77.4500),
    ],
  ),
  _Zone(
    name: 'BHEL',
    controller: 'Power Lifters',
    ap: 1820,
    color: const Color(0xFF14B8A6),
    polygon: [
      LatLng(23.2480, 77.4550),
      LatLng(23.2480, 77.4720),
      LatLng(23.2380, 77.4720),
      LatLng(23.2380, 77.4550),
    ],
  ),
];

// ─── INDORE ZONES ───
final _indoreZones = [
  _Zone(
    name: 'Vijay Nagar',
    controller: 'Indore Spartans',
    ap: 4100,
    color: FitColors.primary,
    polygon: [
      LatLng(22.7530, 75.8850),
      LatLng(22.7530, 75.9010),
      LatLng(22.7430, 75.9010),
      LatLng(22.7430, 75.8850),
    ],
  ),
  _Zone(
    name: 'Palasia',
    controller: 'Beast Mode',
    ap: 3200,
    color: FitColors.challengeGroup,
    polygon: [
      LatLng(22.7260, 75.8700),
      LatLng(22.7260, 75.8860),
      LatLng(22.7170, 75.8860),
      LatLng(22.7170, 75.8700),
    ],
  ),
  _Zone(
    name: 'Sapna Sangeeta',
    controller: 'Running Republic',
    ap: 2600,
    color: FitColors.challengeVersus,
    polygon: [
      LatLng(22.7380, 75.8680),
      LatLng(22.7380, 75.8830),
      LatLng(22.7290, 75.8830),
      LatLng(22.7290, 75.8680),
    ],
  ),
  _Zone(
    name: 'Rajwada',
    controller: 'Old City Hustlers',
    ap: 1450,
    color: FitColors.challengeStake,
    polygon: [
      LatLng(22.7190, 75.8540),
      LatLng(22.7190, 75.8680),
      LatLng(22.7100, 75.8680),
      LatLng(22.7100, 75.8540),
    ],
  ),
  _Zone(
    name: 'AB Road',
    controller: 'Cycle Warriors',
    ap: 1980,
    color: FitColors.challengeZone,
    polygon: [
      LatLng(22.7150, 75.8860),
      LatLng(22.7150, 75.9020),
      LatLng(22.7060, 75.9020),
      LatLng(22.7060, 75.8860),
    ],
  ),
  _Zone(
    name: 'Bhawarkuan',
    controller: 'HIIT Squad',
    ap: 2300,
    color: const Color(0xFF8B5CF6),
    polygon: [
      LatLng(22.7440, 75.8520),
      LatLng(22.7440, 75.8680),
      LatLng(22.7350, 75.8680),
      LatLng(22.7350, 75.8520),
    ],
  ),
  _Zone(
    name: 'Rau',
    controller: 'Unclaimed',
    ap: 280,
    color: FitColors.textMuted,
    polygon: [
      LatLng(22.6730, 75.8640),
      LatLng(22.6730, 75.8800),
      LatLng(22.6640, 75.8800),
      LatLng(22.6640, 75.8640),
    ],
  ),
  _Zone(
    name: 'Scheme 78',
    controller: 'Flex Nation',
    ap: 1750,
    color: const Color(0xFFEC4899),
    polygon: [
      LatLng(22.7530, 75.9050),
      LatLng(22.7530, 75.9200),
      LatLng(22.7440, 75.9200),
      LatLng(22.7440, 75.9050),
    ],
  ),
  _Zone(
    name: 'MR 10',
    controller: 'Morning Joggers',
    ap: 1320,
    color: const Color(0xFF14B8A6),
    polygon: [
      LatLng(22.7620, 75.8950),
      LatLng(22.7620, 75.9100),
      LatLng(22.7540, 75.9100),
      LatLng(22.7540, 75.8950),
    ],
  ),
  _Zone(
    name: 'South Tukoganj',
    controller: 'Unclaimed',
    ap: 190,
    color: FitColors.textMuted,
    polygon: [
      LatLng(22.7200, 75.8750),
      LatLng(22.7200, 75.8850),
      LatLng(22.7140, 75.8850),
      LatLng(22.7140, 75.8750),
    ],
  ),
];

final _mockZones = [..._bhopalZones, ..._indoreZones];

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  _Zone? _selectedZone;
  String _city = 'Bhopal';

  static const _bhopalCenter = LatLng(23.2250, 77.4200);
  static const _indoreCenter = LatLng(22.7300, 75.8800);

  LatLng get _center => _city == 'Bhopal' ? _bhopalCenter : _indoreCenter;
  List<_Zone> get _zones => _city == 'Bhopal' ? _bhopalZones : _indoreZones;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Territory Map',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        actions: [
          // City toggle
          TextButton(
            onPressed: () {
              setState(() {
                _selectedZone = null;
                _city = _city == 'Bhopal' ? 'Indore' : 'Bhopal';
              });
              _mapController.move(_center, 13.5);
            },
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.swap_horiz, color: FitColors.primary, size: 18),
                const SizedBox(width: 4),
                Text(
                  _city == 'Bhopal' ? 'Indore' : 'Bhopal',
                  style: const TextStyle(color: FitColors.primary, fontSize: 13),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _center,
              initialZoom: 13.5,
              onTap: (_, __) => setState(() => _selectedZone = null),
              backgroundColor: FitColors.bgDark,
            ),
            children: [
              // Dark tile layer (free OpenStreetMap)
              TileLayer(
                urlTemplate:
                    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.fitarena.app',
              ),

              // Zone polygons
              PolygonLayer(
                polygons: _zones.map((zone) {
                  final isSelected = _selectedZone == zone;
                  return Polygon(
                    points: zone.polygon,
                    color: zone.color.withValues(alpha: isSelected ? 0.5 : 0.25),
                    borderColor: zone.color,
                    borderStrokeWidth: isSelected ? 3 : 1.5,
                    isFilled: true,
                  );
                }).toList(),
              ),

              // Zone labels
              MarkerLayer(
                markers: _zones.map((zone) {
                  final center = _polygonCenter(zone.polygon);
                  return Marker(
                    point: center,
                    width: 100,
                    height: 40,
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedZone = zone),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: FitColors.bgCard.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: zone.color.withValues(alpha: 0.6),
                          ),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              zone.name,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: FitColors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              '${zone.ap} AP',
                              style: TextStyle(
                                fontSize: 9,
                                color: zone.color,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Current zone card (top)
          Positioned(
            top: 8,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: FitColors.bgCard.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: FitColors.primary.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.location_on,
                      color: FitColors.primary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Your Zone: MP Nagar',
                          style: TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                        Text(
                          'Rank #3 \u{2022} 1,245 AP this week',
                          style: TextStyle(
                              color: FitColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Selected zone bottom sheet
          if (_selectedZone != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _buildZoneSheet(_selectedZone!),
            ),
        ],
      ),
      floatingActionButton: _selectedZone == null
          ? FloatingActionButton(
              onPressed: () => context.push('/log-activity'),
              backgroundColor: FitColors.primary,
              child: const Icon(Icons.add, color: FitColors.bgDark),
            )
          : null,
    );
  }

  Widget _buildZoneSheet(_Zone zone) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: FitColors.bgElevated,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: zone.color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                zone.name,
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Controlled by ${zone.controller}',
            style: const TextStyle(color: FitColors.textSecondary),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _statChip('\u{26A1}', '${zone.ap} AP', zone.color),
              const SizedBox(width: 12),
              _statChip('\u{1F465}', '3 groups', FitColors.textSecondary),
              const SizedBox(width: 12),
              _statChip('\u{1F4C5}', 'Resets Mon', FitColors.textSecondary),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Leaderboard',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 8),
          _leaderRow('\u{1F947}', zone.controller, '${zone.ap} AP'),
          _leaderRow('\u{1F948}', 'Fitness Freaks', '2,100 AP'),
          _leaderRow('\u{1F949}', 'Your Group', '1,245 AP'),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.push('/log-activity'),
              child: const Text('Log Activity for This Zone'),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _statChip(String emoji, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: FitColors.bgElevated,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(fontSize: 12, color: color)),
        ],
      ),
    );
  }

  Widget _leaderRow(String medal, String name, String ap) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(medal, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(name,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Text(ap,
              style: const TextStyle(
                  color: FitColors.textAccent, fontSize: 13)),
        ],
      ),
    );
  }

  LatLng _polygonCenter(List<LatLng> points) {
    double lat = 0, lng = 0;
    for (final p in points) {
      lat += p.latitude;
      lng += p.longitude;
    }
    return LatLng(lat / points.length, lng / points.length);
  }
}
