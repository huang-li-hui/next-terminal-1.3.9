package stat

import "sync"

type systemLoad struct {
	LoadStat   *LoadStat  `json:"loadStat"`
	Mem        *Mem       `json:"mem"`
	MemStat    []*entry   `json:"memStat"`
	Cpu        *Cpu       `json:"cpu"`
	CpuStat    []*entry   `json:"cpuStat"`
	Disk       *Disk      `json:"disk"`
	DiskIOStat []*ioEntry `json:"diskIO"`
	NetIOStat  []*ioEntry `json:"netIO"`
}

type Mem struct {
	Total       uint64  `json:"total"`
	Available   uint64  `json:"available"`
	Used        uint64  `json:"used"`
	UsedPercent float64 `json:"usedPercent"`
}

type Cpu struct {
	Count       int        `json:"count"`
	PhyCount    int        `json:"phyCount"`
	UsedPercent float64    `json:"usedPercent"`
	Info        []*CpuInfo `json:"info"`
}

type Disk struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Available   uint64  `json:"available"`
	UsedPercent float64 `json:"usedPercent"`
}

type CpuInfo struct {
	ModelName string  `json:"modelName"`
	CacheSize int32   `json:"cacheSize"`
	MHZ       float64 `json:"mhz"`
}

type LoadStat struct {
	Load1   float64 `json:"load1"`
	Load5   float64 `json:"load5"`
	Load15  float64 `json:"load15"`
	Percent float64 `json:"percent"`
}

type entry struct {
	Time  string  `json:"time"`
	Value float64 `json:"value"`
}

func NewStat(time string, value float64) *entry {
	return &entry{
		Time:  time,
		Value: value,
	}
}

func NewIOStat(time string, read, write uint64) *ioEntry {
	return &ioEntry{
		Time:  time,
		Read:  read,
		Write: write,
	}
}

type ioEntry struct {
	Time  string `json:"time"`
	Read  uint64 `json:"read"`
	Write uint64 `json:"write"`
}

var SystemLoad *systemLoad

// Mu 保护 SystemLoad 的并发访问：
// 后台 ticker 每5秒写入，/overview/ps 接口并发读取（JSON序列化）
var Mu sync.RWMutex

// GetSystemLoad 返回 SystemLoad 的深拷贝，供 HTTP 接口安全读取
func GetSystemLoad() *systemLoad {
	Mu.RLock()
	defer Mu.RUnlock()

	cp := &systemLoad{
		Mem:     copyMem(SystemLoad.Mem),
		Cpu:     copyCpu(SystemLoad.Cpu),
		Disk:    copyDisk(SystemLoad.Disk),
		MemStat: copyEntries(SystemLoad.MemStat),
		CpuStat: copyEntries(SystemLoad.CpuStat),
	}
	if SystemLoad.LoadStat != nil {
		ls := *SystemLoad.LoadStat
		cp.LoadStat = &ls
	}
	cp.DiskIOStat = copyIOEntries(SystemLoad.DiskIOStat)
	cp.NetIOStat = copyIOEntries(SystemLoad.NetIOStat)
	return cp
}

func copyMem(m *Mem) *Mem {
	if m == nil {
		return nil
	}
	c := *m
	return &c
}

func copyCpu(c *Cpu) *Cpu {
	if c == nil {
		return nil
	}
	cp := *c
	cp.Info = make([]*CpuInfo, len(c.Info))
	for i, v := range c.Info {
		if v != nil {
			info := *v
			cp.Info[i] = &info
		}
	}
	return &cp
}

func copyDisk(d *Disk) *Disk {
	if d == nil {
		return nil
	}
	c := *d
	return &c
}

func copyEntries(in []*entry) []*entry {
	if in == nil {
		return nil
	}
	out := make([]*entry, len(in))
	for i, v := range in {
		if v != nil {
			e := *v
			out[i] = &e
		}
	}
	return out
}

func copyIOEntries(in []*ioEntry) []*ioEntry {
	if in == nil {
		return nil
	}
	out := make([]*ioEntry, len(in))
	for i, v := range in {
		if v != nil {
			e := *v
			out[i] = &e
		}
	}
	return out
}

func init() {
	SystemLoad = &systemLoad{
		LoadStat: &LoadStat{
			Load1:   0,
			Load5:   0,
			Load15:  0,
			Percent: 0,
		},
		Mem: &Mem{
			Total:       0,
			Available:   0,
			Used:        0,
			UsedPercent: 0,
		},
		MemStat: make([]*entry, 0),
		Cpu: &Cpu{
			Count:       0,
			UsedPercent: 0,
		},
		CpuStat: make([]*entry, 0),
		Disk: &Disk{
			Total:       0,
			Used:        0,
			UsedPercent: 0,
		},
		DiskIOStat: make([]*ioEntry, 0),
		NetIOStat:  make([]*ioEntry, 0),
	}
}
